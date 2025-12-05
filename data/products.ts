export interface Product {
    id: string;
    slug: string;
    name: string;
    style: string;
    abv: string;
    volume: string;
    price: number;
    description: string;
    images: string[];
    inStock: boolean;
    stockCount?: number;
    btwCategory?: number; // BTW/VAT percentage: 0, 6, 12, or 21 (default: 21)
}

export const products: Product[] = [
    {
        id: "1",
        slug: "betoverende-becca",
        name: "Betoverende Becca",
        style: "Golden Stout",
        abv: "5.8%",
        volume: "33cl",
        price: 2.2,
        description:
            "A velvety Golden Stout, enriched with coffee beans from Onan (El Salvador Castillo), delicate vanilla beans, rich cacao beans, and aromatic tonka beans. Thanks to the generous use of oats, you enjoy a silky smooth body, framed by a lush palette of intense coffee, dark chocolate, and soft vanilla. Prepare for an enchanting taste sensation.",
        images: [
            "https://www.manenbrouw.be/wp-content/uploads/2025/05/PXL_20250506_180954534-EDIT.jpg",
        ],
        inStock: true,
    },
    {
        id: "2",
        slug: "passionele-pommelien",
        name: "Passionele Pommelien",
        style: "Cider X Saison",
        abv: "6.0%",
        volume: "33cl",
        price: 1.9,
        description:
            "Man & Brouw and Most Cider joined forces to create a unique blend of Cider and Saison beer. The 'taste-selected' apples come from local orchards in the Hageland. These were combined with a Saison brewed with locally grown and malted grains. 60% Saison, 40% cider.",
        images: [
            "https://www.manenbrouw.be/wp-content/uploads/2025/04/PXL_20250402_1732125882-scaled.jpg",
        ],
        inStock: true,
    },
    {
        id: "3",
        slug: "malafide-margarita",
        name: "Malafide Margarita",
        style: "Bloedappelsien Margarita Sour",
        abv: "5.7%",
        volume: "33cl",
        price: 2.0,
        description:
            "A refreshing sour ale inspired by the classic Margarita cocktail. Brewed with blood oranges for a zesty, fruity kick.",
        images: ["https://www.manenbrouw.be/wp-content/uploads/2025/02/socials.png"], // Placeholder from mail
        inStock: true,
    },
    {
        id: "4",
        slug: "joviale-jasmien",
        name: "Joviale Jasmien",
        style: "Saison",
        abv: "6.6%",
        volume: "33cl",
        price: 1.9,
        description:
            "A floral and spicy Saison brewed with Jasmine tea and Szechuan pepper. A complex and aromatic beer perfect for sunny days.",
        images: ["https://www.manenbrouw.be/wp-content/uploads/2025/01/jj.png"], // Placeholder from mail
        inStock: true,
    },
    {
        id: "5",
        slug: "wulpse-wanda",
        name: "Wulpse Wanda",
        style: "Barley Wine",
        abv: "15.4%",
        volume: "33cl",
        price: 2.2,
        description:
            "A heavy hitter! This Barley Wine has been aged in Whiskey barrels, resulting in a complex, boozy, and rich beer with notes of caramel, vanilla, and oak.",
        images: [
            "https://www.manenbrouw.be/wp-content/uploads/2024/11/6259989a-638f-4894-ba1f-0bf80c7b4f53-1_all_18598-scaled.jpg",
        ],
        inStock: true,
    },
];
