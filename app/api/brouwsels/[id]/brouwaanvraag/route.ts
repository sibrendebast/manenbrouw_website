import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import JSZip from "jszip";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // 1. Fetch data
        const brouwsel = await prisma.brouwsel.findUnique({
            where: { id },
            include: {
                recipe: {
                    include: {
                        ingredients: { orderBy: { volgorde: 'asc' } },
                        maischStappen: { orderBy: { volgorde: 'asc' } },
                        fermentatieStappen: { orderBy: { volgorde: 'asc' } },
                    }
                }
            }
        });

        if (!brouwsel || !brouwsel.recipe) {
            return NextResponse.json({ error: "Brouwsel or Recipe not found" }, { status: 404 });
        }

        const recipe = brouwsel.recipe;
        const totalVolume = brouwsel.volume || brouwsel.recipe.batchVolume || 0;
        const volumeHl = totalVolume / 100;

        // 2. Prepare data for templates
        const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
        };

        const moutIngredients = recipe.ingredients.filter((i: any) => i.type === 'MOUT');
        const totalMoutWeight = moutIngredients.reduce((acc: number, i: any) => acc + (i.hoeveelheid || 0), 0);

        const data = {
            Brewnumber: brouwsel.brouwnummer,
            biernaam: recipe.naam,
            receptnaam: recipe.naam,
            receptNaam: recipe.naam,
            brouwnummer: brouwsel.brouwnummer,
            datum: formatDate(brouwsel.aanvraagDatum || brouwsel.datum),
            brouwdatum: formatDate(brouwsel.datum),
            aanvraagdatum: brouwsel.aanvraagDatum ? formatDate(brouwsel.aanvraagDatum) : formatDate(brouwsel.datum),
            stijl: recipe.stijl || "",
            volume: totalVolume,
            volume_hl: volumeHl.toFixed(2),
            og: brouwsel.ogGemeten?.toFixed(3) || recipe.ogCalc?.toFixed(3) || "",
            plato_og: brouwsel.platoGemeten?.toFixed(1) || recipe.platoCalc?.toFixed(1) || "",
            fg: brouwsel.fgGemeten?.toFixed(3) || recipe.fgCalc?.toFixed(3) || "",
            abv: brouwsel.abvGemeten?.toFixed(1) || recipe.abvCalc?.toFixed(1) || "",
            ebc: recipe.ebcCalc?.toFixed(1) || "",
            ibu: recipe.ibuCalc?.toFixed(0) || "",
            notities: recipe.notities || "",

            // Totals
            totaal_mout: totalMoutWeight.toFixed(2),
            mout_per_hl: volumeHl > 0 ? (totalMoutWeight / volumeHl).toFixed(2) : "0.00",

            // Ingredients
            mout: moutIngredients.map((i: any) => ({
                naam: i.naam,
                hoeveelheid: i.hoeveelheid,
                per_hl: volumeHl > 0 ? (i.hoeveelheid / volumeHl).toFixed(2) : "0.00",
                eenheid: i.eenheid,
                lot: i.lot || ""
            })),
            hop: recipe.ingredients.filter((i: any) => i.type === 'HOP').map((i: any) => ({
                naam: i.naam,
                hoeveelheid: i.hoeveelheid,
                per_hl: volumeHl > 0 ? (i.hoeveelheid / volumeHl).toFixed(2) : "0.00",
                eenheid: i.eenheid,
                tijd: i.tijdMinuten || "",
                lot: i.lot || ""
            })),
            gist: recipe.ingredients.filter((i: any) => i.type === 'GIST').map((i: any) => ({
                naam: i.naam,
                hoeveelheid: i.hoeveelheid,
                eenheid: i.eenheid,
                lot: i.lot || ""
            })),
            overig: recipe.ingredients.filter((i: any) => i.type === 'ANDERE').map((i: any) => ({
                naam: i.naam,
                hoeveelheid: i.hoeveelheid,
                eenheid: i.eenheid,
                lot: i.lot || ""
            })),

            // Steps
            maischStappen: recipe.maischStappen.map((s: any) => ({
                naam: s.stapNaam,
                temp: s.tempC || "",
                duur: s.duurMin || ""
            })),
            fermentatieStappen: recipe.fermentatieStappen.map((s: any) => ({
                naam: s.stapNaam,
                temp: s.tempC || "",
                duur: s.duurDagen || ""
            }))
        };

        // 3. Generate documents
        const zip = new JSZip();
        const templatesDir = path.join(process.cwd(), "templates");

        const templateFiles = [
            { name: `Basislijst_${brouwsel.brouwnummer.replace('/', '-')}.docx`, file: "2026_0XX_basislijst_template.docx" },
            { name: `Brouwaangifte_${brouwsel.brouwnummer.replace('/', '-')}.docx`, file: "2026_000_brouwaangifte_template.docx" }
        ];

        for (const t of templateFiles) {
            const templatePath = path.join(templatesDir, t.file);
            if (!fs.existsSync(templatePath)) {
                console.error(`Template not found: ${templatePath}`);
                continue;
            }

            const content = fs.readFileSync(templatePath, "binary");
            const pizzip = new PizZip(content);
            const doc = new Docxtemplater(pizzip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            doc.render(data);

            const buf = doc.getZip().generate({
                type: "nodebuffer",
                compression: "DEFLATE",
            });

            zip.file(t.name, buf);
        }

        const finalZip = await zip.generateAsync({ type: "nodebuffer" });

        // 4. Return as download
        const filename = `Brouwaanvraag_${brouwsel.brouwnummer.replace('/', '-')}.zip`;

        return new NextResponse(new Uint8Array(finalZip), {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error("Brouwaanvraag generation error:", error);
        return NextResponse.json({ error: "Failed to generate documents" }, { status: 500 });
    }
}
