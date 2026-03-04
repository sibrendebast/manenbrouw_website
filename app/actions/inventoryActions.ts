'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import {
  RawMaterialCategory,
  StockDeviationAction,
  AuditActionType,
} from '@prisma/client';

// ═════════════════════════════════════════════════════════════════════════════
// HELPER: Convert Decimal to number for client serialization
// ═════════════════════════════════════════════════════════════════════════════

function convertDecimalToNumber(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Decimal) return Number(obj);
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(convertDecimalToNumber);
  if (typeof obj === 'object') {
    const converted: Record<string, unknown> = {};
    for (const key in obj) {
      converted[key] = convertDecimalToNumber((obj as Record<string, unknown>)[key]);
    }
    return converted;
  }
  return obj;
}

// ═════════════════════════════════════════════════════════════════════════════
// RAW MATERIALS
// ═════════════════════════════════════════════════════════════════════════════

export async function createRawMaterial(
  data: {
    name: string;
    category: RawMaterialCategory;
    unit?: string;
    description?: string;
  }
) {
  try {
    const existing = await prisma.rawMaterial.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error(`Grondstof "${data.name}" bestaat al`);
    }

    const material = await prisma.rawMaterial.create({
      data: {
        name: data.name,
        category: data.category,
        unit: data.unit || 'kg',
        description: data.description,
      },
    });

    // Audit log
    await createAuditLog({
      documentType: 'RawMaterial',
      documentId: material.id,
      action: 'CREATE',
      newValue: {
        name: material.name,
        category: material.category,
        unit: material.unit,
      },
    });

    return { success: true, data: convertDecimalToNumber(material) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

export async function getRawMaterials(category?: RawMaterialCategory) {
  try {
    const materials = await prisma.rawMaterial.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: 'asc' },
      include: {
        lots: {
          where: { status: { not: 'expired' } },
          select: {
            id: true,
            lotNumber: true,
            quantityTotal: true,
            quantityAllocated: true,
            expiryDate: true,
            unitCost: true,
            status: true,
          },
        },
      },
    });

    // Calculate inventory summaries
    const withSummary = (materials as any[]).map((m: any) => {
      const totalQty = m.lots.reduce(
        (sum: number, lot: any) => sum + Number(lot.quantityTotal),
        0
      );
      const allocatedQty = m.lots.reduce(
        (sum: number, lot: any) => sum + Number(lot.quantityAllocated),
        0
      );
      const availableQty = totalQty - allocatedQty;

      return {
        ...m,
        totalQuantity: totalQty,
        allocatedQuantity: allocatedQty,
        availableQuantity: availableQty,
      };
    });

    return { success: true, data: convertDecimalToNumber(withSummary) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

export async function getRawMaterialById(id: string) {
  try {
    const material = await prisma.rawMaterial.findUnique({
      where: { id },
      include: {
        lots: {
          orderBy: { expiryDate: 'asc' },
          select: {
            id: true,
            lotNumber: true,
            quantityTotal: true,
            quantityAllocated: true,
            expiryDate: true,
            unitCost: true,
            status: true,
          },
        },
      },
    });

    if (!material) {
      throw new Error('Grondstof niet gevonden');
    }

    return { success: true, data: convertDecimalToNumber(material) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

export async function deleteRawMaterial(id: string) {
  try {
    // Check if material is used in recipe ingredients
    const recipeUsage = await prisma.recipeIngredient.count({
      where: { materialId: id },
    });
    if (recipeUsage > 0) {
      return {
        success: false,
        error: `Kan niet verwijderen: grondstof is gekoppeld aan ${recipeUsage} recept(en). Verwijder eerst de koppeling in de receptuur.`,
      };
    }

    // Check if material has been used in stock allocations (uitslag)
    const allocationUsage = await prisma.stockAllocationLine.count({
      where: { materialId: id },
    });
    if (allocationUsage > 0) {
      return {
        success: false,
        error: `Kan niet verwijderen: grondstof is gebruikt in ${allocationUsage} uitslag(en). Historische data kan niet gewist worden.`,
      };
    }

    // Get lot IDs for cascading deletes
    const lots = await prisma.inventoryLot.findMany({
      where: { materialId: id },
      select: { id: true },
    });
    const lotIds = lots.map((l: { id: string }) => l.id);

    // Delete in transaction
    await prisma.$transaction(async (tx: typeof prisma) => {
      // Delete stock movements
      await tx.stockMovement.deleteMany({ where: { materialId: id } });

      // Delete receipt lines referencing this material
      await tx.stockReceiptLine.deleteMany({ where: { materialId: id } });

      // Delete inventory lots
      if (lotIds.length > 0) {
        await tx.inventoryLot.deleteMany({ where: { materialId: id } });
      }

      // Delete the raw material
      await tx.rawMaterial.delete({ where: { id } });
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout bij verwijderen',
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// SUPPLIERS
// ═════════════════════════════════════════════════════════════════════════════

export async function createSupplier(
  data: {
    name: string;
    address?: string;
    contact?: string;
    phone?: string;
    email?: string;
    kboNumber?: string;
    favvNumber?: string;
  }
) {
  try {
    const supplier = await prisma.supplier.create({
      data,
    });

    await createAuditLog({
      documentType: 'Supplier',
      documentId: supplier.id,
      action: 'CREATE',
      newValue: { name: supplier.name },
    });

    return { success: true, data: convertDecimalToNumber(supplier) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: convertDecimalToNumber(suppliers) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// STOCK RECEIPTS (INSLAG)
// ═════════════════════════════════════════════════════════════════════════════

type StockReceiptLineInput = {
  materialId: string;
  quantityReceived: number;
  unitCost: number;
  lotNumber: string;
  expiryDate: Date;
};

export async function createStockReceipt(
  data: {
    supplierId: string;
    invoiceNumber?: string;
    receivedDate: Date;
    manufacturer?: string;
    deviationFlag?: boolean;
    deviationAction?: StockDeviationAction;
    deviationNotes?: string;
    notes?: string;
    lines: StockReceiptLineInput[];
  }
) {
  try {
    // Validate inputs
    if (!data.lines || data.lines.length === 0) {
      throw new Error('Minstens één regel is verplicht');
    }

    if (new Date(data.receivedDate) > new Date()) {
      throw new Error('Ontvangstdatum kan niet in de toekomst liggen');
    }

    // Check all materials exist
    const materialIds = data.lines.map((l) => l.materialId);
    const materials = await prisma.rawMaterial.findMany({
      where: { id: { in: materialIds } },
    });

    if (materials.length !== materialIds.length) {
      throw new Error('Een of meer grondstoffen niet gevonden');
    }

    // Create receipt with nested lines and lots
    const receipt = await prisma.stockReceipt.create({
      data: {
        supplierId: data.supplierId,
        invoiceNumber: data.invoiceNumber,
        receivedDate: data.receivedDate,
        manufacturer: data.manufacturer,
        deviationFlag: data.deviationFlag || false,
        deviationAction: data.deviationAction || 'GEEN_AFWIJKING',
        deviationNotes: data.deviationNotes,
        notes: data.notes,
        lines: {
          create: await Promise.all(
            data.lines.map(async (line) => {
              // Create or find lot
              let lot = await prisma.inventoryLot.findFirst({
                where: {
                  materialId: line.materialId,
                  lotNumber: line.lotNumber,
                  supplierId: data.supplierId,
                },
              });

              if (!lot) {
                lot = await prisma.inventoryLot.create({
                  data: {
                    materialId: line.materialId,
                    lotNumber: line.lotNumber,
                    supplierId: data.supplierId,
                    expiryDate: new Date(line.expiryDate),
                    quantityTotal: new Decimal(line.quantityReceived),
                    unitCost: new Decimal(line.unitCost),
                    status: 'active',
                  },
                });
              } else {
                // Update existing lot: add to quantity
                lot = await prisma.inventoryLot.update({
                  where: { id: lot.id },
                  data: {
                    quantityTotal: lot.quantityTotal.plus(
                      new Decimal(line.quantityReceived)
                    ),
                  },
                });
              }

              return {
                materialId: line.materialId,
                quantityReceived: new Decimal(line.quantityReceived),
                unitCost: new Decimal(line.unitCost),
                lotId: lot.id,
              };
            })
          ),
        },
      },
      include: {
        lines: { include: { material: true, lot: true } },
        supplier: true,
      },
    });

    // Create stock movements
    for (const line of receipt.lines) {
      await prisma.stockMovement.create({
        data: {
          materialId: line.materialId,
          lotId: line.lotId!,
          movementType: 'receipt',
          quantity: new Decimal(Number(line.quantityReceived)),
          referenceType: 'StockReceipt',
          referenceId: receipt.id,
        },
      });
    }

    // Audit log
    await createAuditLog({
      documentType: 'StockReceipt',
      documentId: receipt.id,
      action: 'RECEIVE',
      stockReceiptId: receipt.id,
      context: `Ontvangst van ${receipt.lines.length} regel(s) van ${receipt.supplier.name}`,
      newValue: {
        invoiceNumber: receipt.invoiceNumber,
        lineCount: receipt.lines.length,
      },
    });

    return { success: true, data: convertDecimalToNumber(receipt) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

export async function getStockReceipts(limit = 50) {
  try {
    const receipts = await prisma.stockReceipt.findMany({
      orderBy: { receivedDate: 'desc' },
      include: {
        supplier: true,
        lines: { include: { material: true, lot: true } },
      },
      take: limit,
    });
    return { success: true, data: convertDecimalToNumber(receipts) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// STOCK ALLOCATIONS (UITSLAG)
// ═════════════════════════════════════════════════════════════════════════════

type StockAllocationLineInput = {
  materialId: string;
  lotId: string;
  quantityAllocated: number;
};

export async function createStockAllocation(
  data: {
    brewNumber: string;
    allocationDate: Date;
    notes?: string;
    lines: StockAllocationLineInput[];
  }
) {
  try {
    // Validate inputs
    if (!data.lines || data.lines.length === 0) {
      throw new Error('Minstens één regel is verplicht');
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { brouwnummer: data.brewNumber },
    });

    if (!recipe) {
      throw new Error(`Brouwsel ${data.brewNumber} niet gevonden`);
    }

    // Check if allocation already exists for this brew
    const existing = await prisma.stockAllocation.findUnique({
      where: { brewNumber: data.brewNumber },
    });

    if (existing) {
      throw new Error(`Allocatie voor brouwsel ${data.brewNumber} bestaat al`);
    }

    // Validate all lots and check quantities
    for (const line of data.lines) {
      const lot = await prisma.inventoryLot.findUnique({
        where: { id: line.lotId },
      });

      if (!lot) {
        throw new Error(`Lot ${line.lotId} niet gevonden`);
      }

      if (lot.status === 'expired') {
        throw new Error(`Lot ${lot.lotNumber} is verlopen`);
      }

      if (lot.status === 'quarantined') {
        throw new Error(`Lot ${lot.lotNumber} is in quarantaine`);
      }

      const available = lot.quantityTotal.minus(lot.quantityAllocated);
      if (new Decimal(line.quantityAllocated).greaterThan(available)) {
        throw new Error(
          `Onvoldoende voorraad: ${lot.lotNumber} (beschikbaar: ${available}, gevraagd: ${line.quantityAllocated})`
        );
      }
    }

    // Create allocation and lines
    let totalCost = new Decimal(0);
    const lines = await Promise.all(
      data.lines.map(async (line) => {
        const lot = await prisma.inventoryLot.findUniqueOrThrow({
          where: { id: line.lotId },
        });

        const lineCost = new Decimal(line.quantityAllocated).times(lot.unitCost);
        totalCost = totalCost.plus(lineCost);

        return {
          materialId: line.materialId,
          lotId: line.lotId,
          quantityAllocated: new Decimal(line.quantityAllocated),
          unitCostAtAllocation: lot.unitCost,
          lineCost: lineCost,
        };
      })
    );

    const allocation = await prisma.stockAllocation.create({
      data: {
        brewNumber: data.brewNumber,
        allocationDate: data.allocationDate,
        notes: data.notes,
        totalCost: totalCost,
        lines: {
          create: lines,
        },
      },
      include: {
        lines: { include: { material: true, lot: true } },
      },
    });

    // Update lot quantities and create stock movements
    for (const line of allocation.lines) {
      await prisma.inventoryLot.update({
        where: { id: line.lotId },
        data: {
          quantityAllocated: {
            increment: line.quantityAllocated,
          },
        },
      });

      await prisma.stockMovement.create({
        data: {
          materialId: line.materialId,
          lotId: line.lotId,
          movementType: 'allocation',
          quantity: new Decimal(Number(line.quantityAllocated)).negated(),
          referenceType: 'StockAllocation',
          referenceId: allocation.id,
        },
      });
    }

    // Audit log
    await createAuditLog({
      documentType: 'StockAllocation',
      documentId: allocation.id,
      action: 'ALLOCATE',
      context: `Allocatie voor brouwsel ${data.brewNumber}: ${allocation.lines.length} regel(s), totaal €${totalCost}`,
      newValue: {
        brewNumber: data.brewNumber,
        lineCount: allocation.lines.length,
        totalCost: totalCost.toString(),
      },
    });

    return { success: true, data: convertDecimalToNumber(allocation) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

export async function getStockAllocations() {
  try {
    const allocations = await prisma.stockAllocation.findMany({
      orderBy: { allocationDate: 'desc' },
      include: {
        lines: { include: { material: true, lot: true } },
      },
    });
    return { success: true, data: convertDecimalToNumber(allocations) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

export async function getStockAllocationByBrewNumber(brewNumber: string) {
  try {
    const allocation = await prisma.stockAllocation.findUnique({
      where: { brewNumber },
      include: {
        lines: { include: { material: true, lot: true } },
      },
    });

    if (!allocation) {
      return { success: false, error: 'Allocatie niet gevonden' };
    }

    return { success: true, data: convertDecimalToNumber(allocation) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// INVENTORY LOTS
// ═════════════════════════════════════════════════════════════════════════════

export async function getInventoryLotById(id: string) {
  try {
    const lot = await prisma.inventoryLot.findUnique({
      where: { id },
      include: {
        material: true,
        supplier: true,
        allocations: {
          include: {
            allocation: true,
          },
        },
      },
    });

    if (!lot) {
      throw new Error('Lot niet gevonden');
    }

    return { success: true, data: convertDecimalToNumber(lot) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

export async function updateLotStatus(
  id: string,
  status: string,
  context?: string
) {
  try {
    const lot = await prisma.inventoryLot.findUniqueOrThrow({
      where: { id },
    });

    const updated = await prisma.inventoryLot.update({
      where: { id },
      data: { status },
    });

    await createAuditLog({
      documentType: 'InventoryLot',
      documentId: id,
      action: 'UPDATE',
      context: context || `Status gewijzigd naar: ${status}`,
      oldValue: { status: lot.status },
      newValue: { status: updated.status },
    });

    return { success: true, data: convertDecimalToNumber(updated) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════

export async function getInventoryDashboard() {
  try {
    const now = new Date();
    const twoWeeksFuture = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Expired lots
    const expiredLots = await prisma.inventoryLot.findMany({
      where: {
        expiryDate: { lt: now },
        status: { not: 'expired' },
      },
      include: { material: true, supplier: true },
      orderBy: { expiryDate: 'asc' },
    });

    // Update their status
    for (const lot of expiredLots) {
      await prisma.inventoryLot.update({
        where: { id: lot.id },
        data: { status: 'expired' },
      });
    }

    // Near-expiry lots (within 14 days)
    const nearExpiryLots = await prisma.inventoryLot.findMany({
      where: {
        expiryDate: { gte: now, lte: twoWeeksFuture },
        status: { not: 'expired' },
      },
      include: { material: true, supplier: true },
      orderBy: { expiryDate: 'asc' },
    });

    // Category totals
    const categories = await prisma.rawMaterial.findMany({
      distinct: ['category'],
      select: { category: true },
    });

    const categoryTotals = await Promise.all(
      categories.map(async (cat: any) => {
        const lots = await prisma.inventoryLot.findMany({
          where: {
            material: { category: cat.category },
          },
          include: { material: true },
        });

        const totalQty = lots.reduce(
          (sum: number, lot: any) => sum + Number(lot.quantityTotal),
          0
        );
        const expiredCount = lots.filter((l: any) => l.status === 'expired').length;
        const nearExpiry = lots.filter(
          (l: any) =>
            l.expiryDate >= now &&
            l.expiryDate <= twoWeeksFuture &&
            l.status !== 'expired'
        ).length;

        return {
          category: cat.category,
          totalQuantity: totalQty,
          lotsCount: lots.length,
          expiredLotsCount: expiredCount,
          nearExpiryCount: nearExpiry,
        };
      })
    );

    // Recent movements
    const recentMovements = await prisma.stockMovement.findMany({
      orderBy: { movedAt: 'desc' },
      include: { material: true },
      take: 20,
    });

    return {
      success: true,
      data: convertDecimalToNumber({
        expiredLots: expiredLots.map((lot: any) => ({
          ...lot,
          quantityAvailable: Number(
            lot.quantityTotal.minus(lot.quantityAllocated)
          ),
          daysOverdue: Math.floor(
            (now.getTime() - lot.expiryDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
        nearExpiryLots: nearExpiryLots.map((lot: any) => ({
          ...lot,
          quantityAvailable: Number(
            lot.quantityTotal.minus(lot.quantityAllocated)
          ),
          daysUntilExpiry: Math.floor(
            (lot.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
        categoryTotals,
        recentMovements: recentMovements.map((m: any) => ({
          ...m,
          quantity: Number(m.quantity),
        })),
      }),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═════════════════════════════════════════════════════════════════════════════

async function createAuditLog(
  data: {
    documentType: string;
    documentId: string;
    action: AuditActionType | string;
    stockReceiptId?: string;
    context?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
  }
) {
  try {
    await prisma.auditLog.create({
      data: {
        documentType: data.documentType,
        documentId: data.documentId,
        action: data.action as AuditActionType,
        context: data.context,
        oldValue: data.oldValue,
        newValue: data.newValue,
        stockReceiptId: data.stockReceiptId,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

export async function getAuditLogs(
  documentType?: string,
  documentId?: string,
  limit = 100
) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        documentType: documentType ? documentType : undefined,
        documentId: documentId ? documentId : undefined,
      },
      orderBy: { changedAt: 'desc' },
      take: limit,
    });
    return { success: true, data: convertDecimalToNumber(logs) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

export async function getRawMaterialAuditTrail(materialId: string, limit = 100) {
  try {
    // Get audit logs for the raw material itself
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        documentType: 'RawMaterial',
        documentId: materialId,
      },
      orderBy: { changedAt: 'desc' },
    });

    // Get stock receipt events (inslag)
    const receiptLines = await prisma.stockReceiptLine.findMany({
      where: { materialId },
      include: {
        receipt: {
          select: {
            id: true,
            receivedDate: true,
            receiptNumber: true,
            invoiceNumber: true,
            supplier: {
              select: { name: true },
            },
          },
        },
        lot: {
          select: {
            lotNumber: true,
          },
        },
      },
      orderBy: {
        receipt: {
          receivedDate: 'desc',
        },
      },
      take: limit,
    });

    // Get stock allocation events (uitslag)
    const allocationLines = await prisma.stockAllocationLine.findMany({
      where: { materialId },
      include: {
        allocation: {
          select: {
            id: true,
            brewNumber: true,
            allocationDate: true,
          },
        },
        lot: {
          select: {
            lotNumber: true,
          },
        },
      },
      orderBy: {
        allocation: {
          allocationDate: 'desc',
        },
      },
      take: limit,
    });

    // Combine and format all events
    const events: any[] = [
      ...auditLogs.map((log: any) => ({
        id: log.id,
        type: 'audit',
        action: log.action,
        timestamp: log.changedAt,
        context: log.context,
      })),
      ...receiptLines.map((line: any) => ({
        id: `receipt-${line.id}`,
        type: 'inslag',
        action: 'INSLAG',
        timestamp: line.receipt.receivedDate,
        context: `Inslag: ${Number(line.quantityReceived)} ${line.receipt.supplier.name ? `van ${line.receipt.supplier.name}` : ''}${line.lot ? ` (lot ${line.lot.lotNumber})` : ''}${line.receipt.receiptNumber ? ` · Ontvangst ${line.receipt.receiptNumber}` : ''}`,
        quantity: Number(line.quantityReceived),
        unitCost: Number(line.unitCost),
      })),
      ...allocationLines.map((line: any) => ({
        id: `allocation-${line.id}`,
        type: 'uitslag',
        action: 'UITSLAG',
        timestamp: line.allocation.allocationDate,
        context: `Uitslag: ${Number(line.quantityAllocated)} voor brouwsel ${line.allocation.brewNumber}${line.lot ? ` (lot ${line.lot.lotNumber})` : ''}`,
        quantity: Number(line.quantityAllocated),
        brewNumber: line.allocation.brewNumber,
      })),
    ];

    // Sort by timestamp descending and limit
    events.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    return {
      success: true,
      data: convertDecimalToNumber(events.slice(0, limit)),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    };
  }
}

