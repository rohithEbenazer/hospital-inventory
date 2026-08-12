const User = require('../models/User');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const Batch = require('../models/Batch');
const InventoryBalance = require('../models/InventoryBalance');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Indent = require('../models/Indent');
const SerialNumber = require('../models/SerialNumber');
const AuditLog = require('../models/AuditLog');
const Category = require('../models/Category');
const Unit = require('../models/Unit');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already contains data. Skipping initial seeding.');
      return;
    }

    console.log('Seeding initial Hospital Inventory dataset (Sections 1-300)...');

    // 0. Seed Section 10 Categories
    const medCategory = await Category.create({ hospitalId: 'HOSP-001', name: 'Medicines', code: 'CAT-MED', itemType: 'MEDICINE', description: 'Pharmaceutical drugs' });
    const consCategory = await Category.create({ hospitalId: 'HOSP-001', name: 'Consumables', code: 'CAT-CONS', itemType: 'CONSUMABLE', description: 'Surgical and clinical consumables' });

    await Category.create([
      { hospitalId: 'HOSP-001', name: 'Antibiotics', code: 'CAT-ANTIBIOTICS', parentId: medCategory._id, itemType: 'MEDICINE' },
      { hospitalId: 'HOSP-001', name: 'Analgesics', code: 'CAT-ANALGESICS', parentId: medCategory._id, itemType: 'MEDICINE' },
      { hospitalId: 'HOSP-001', name: 'Antihypertensives', code: 'CAT-ANTIHYPERTENSIVES', parentId: medCategory._id, itemType: 'MEDICINE' },
      { hospitalId: 'HOSP-001', name: 'Emergency Drugs', code: 'CAT-EMERGENCY', parentId: medCategory._id, itemType: 'MEDICINE' },

      { hospitalId: 'HOSP-001', name: 'Syringes', code: 'CAT-SYRINGES', parentId: consCategory._id, itemType: 'CONSUMABLE' },
      { hospitalId: 'HOSP-001', name: 'Gloves', code: 'CAT-GLOVES', parentId: consCategory._id, itemType: 'CONSUMABLE' },
      { hospitalId: 'HOSP-001', name: 'IV Sets', code: 'CAT-IVSETS', parentId: consCategory._id, itemType: 'CONSUMABLE' },
      { hospitalId: 'HOSP-001', name: 'Catheters', code: 'CAT-CATHETERS', parentId: consCategory._id, itemType: 'CONSUMABLE' }
    ]);

    // 0b. Seed Section 11 Units & Conversions
    await Unit.create([
      { hospitalId: 'HOSP-001', name: 'Box', abbreviation: 'BX', conversions: [{ toUnit: 'Gloves', conversionFactor: 100 }, { toUnit: 'Vials', conversionFactor: 10 }] },
      { hospitalId: 'HOSP-001', name: 'Carton', abbreviation: 'CTN', conversions: [{ toUnit: 'Boxes', conversionFactor: 20 }] },
      { hospitalId: 'HOSP-001', name: 'Pack', abbreviation: 'PK', conversions: [{ toUnit: 'Pieces', conversionFactor: 10 }] },
      { hospitalId: 'HOSP-001', name: 'Piece', abbreviation: 'PC' },
      { hospitalId: 'HOSP-001', name: 'Vial', abbreviation: 'VIAL' },
      { hospitalId: 'HOSP-001', name: 'Ampoule', abbreviation: 'AMP' },
      { hospitalId: 'HOSP-001', name: 'Tablet', abbreviation: 'TAB' },
      { hospitalId: 'HOSP-001', name: 'Capsule', abbreviation: 'CAP' },
      { hospitalId: 'HOSP-001', name: 'Bottle', abbreviation: 'BTL' },
      { hospitalId: 'HOSP-001', name: 'Tube', abbreviation: 'TUBE' },
      { hospitalId: 'HOSP-001', name: 'Kg', abbreviation: 'KG' },
      { hospitalId: 'HOSP-001', name: 'Gram', abbreviation: 'GM' },
      { hospitalId: 'HOSP-001', name: 'Litre', abbreviation: 'LTR' },
      { hospitalId: 'HOSP-001', name: 'Millilitre', abbreviation: 'ML' },
      { hospitalId: 'HOSP-001', name: 'Pair', abbreviation: 'PR' },
      { hospitalId: 'HOSP-001', name: 'Set', abbreviation: 'SET' }
    ]);

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Seed Users
    await User.create([
      { username: 'admin', email: 'admin@scechospital.org', password: hashedPassword, fullName: 'Dr. Sarah Jenkins', role: 'SUPER_ADMIN', department: 'Executive Management' },
      { username: 'store_mgr', email: 'store@scechospital.org', password: hashedPassword, fullName: 'Robert Chen', role: 'STORE_MANAGER', department: 'Central Store' },
      { username: 'pharmacist', email: 'pharmacy@scechospital.org', password: hashedPassword, fullName: 'Elena Rostova', role: 'PHARMACIST', department: 'Main Pharmacy' },
      { username: 'nurse_icu', email: 'nurse.icu@scechospital.org', password: hashedPassword, fullName: 'Nurse Maria Santos', role: 'NURSE', department: 'ICU Ward' },
      { username: 'procure_off', email: 'procure@scechospital.org', password: hashedPassword, fullName: 'David Vance', role: 'PROCUREMENT_OFFICER', department: 'Supply Chain' },
      { username: 'auditor', email: 'auditor@scechospital.org', password: hashedPassword, fullName: 'Patricia Wright', role: 'AUDITOR', department: 'Compliance & Quality' }
    ]);

    // 2. Seed Warehouses
    const centralStore = await Warehouse.create({
      code: 'WH-CENTRAL',
      name: 'Central Main Warehouse',
      type: 'CENTRAL_STORE',
      department: 'Central Store',
      managerName: 'Robert Chen',
      temperatureRange: '15-25°C',
      locations: [
        { code: 'CENTRAL-A1-R01-S01', zone: 'A', rack: 'R01', shelf: 'S01', bin: 'B01', description: 'Medicine Cold Rack' },
        { code: 'CENTRAL-B2-R03-S04', zone: 'B', rack: 'R03', shelf: 'S04', bin: 'B12', description: 'Surgical Consumables' }
      ]
    });

    const pharmacyStore = await Warehouse.create({
      code: 'WH-PHARMACY',
      name: 'OPD Main Pharmacy',
      type: 'PHARMACY',
      department: 'Pharmacy',
      managerName: 'Elena Rostova',
      temperatureRange: '20-25°C'
    });

    const icuStore = await Warehouse.create({
      code: 'WH-ICU',
      name: 'ICU Emergency Sub-store',
      type: 'ICU_STORE',
      department: 'ICU',
      managerName: 'Nurse Maria Santos'
    });

    // 3. Seed Products
    const products = await Product.create([
      {
        sku: 'MED-PAR-500',
        barcode: '890123450001',
        name: 'Paracetamol 500mg Tablets',
        genericName: 'Acetaminophen',
        itemType: 'MEDICINE',
        category: 'Medicines > Analgesics',
        brand: 'Crocin',
        manufacturer: 'GSK Healthcare',
        purchaseUnit: 'Box',
        issueUnit: 'Piece',
        conversionFactor: 100,
        minStock: 500,
        reorderPoint: 1000,
        reorderQuantity: 5000,
        unitCost: 2.50,
        mrp: 5.00,
        requiresExpiry: true,
        requiresBatch: true
      },
      {
        sku: 'MED-AMO-625',
        barcode: '890123450002',
        name: 'Amoxicillin & Clavulanate 625mg',
        genericName: 'Amoxicillin + Clavulanic Acid',
        itemType: 'MEDICINE',
        category: 'Medicines > Antibiotics',
        brand: 'Augmentin',
        manufacturer: 'GSK',
        purchaseUnit: 'Box',
        issueUnit: 'Piece',
        conversionFactor: 10,
        minStock: 200,
        reorderPoint: 500,
        reorderQuantity: 2000,
        unitCost: 18.00,
        mrp: 26.50,
        requiresExpiry: true,
        requiresBatch: true,
        criticalItem: true
      },
      {
        sku: 'CON-SYR-05ML',
        barcode: '890123450003',
        name: 'Disposable Syringe 5ml with Needle',
        genericName: 'Hypodermic Syringe',
        itemType: 'CONSUMABLE',
        category: 'Consumables > Syringes',
        brand: 'Dispovan',
        manufacturer: 'HMD Medical',
        purchaseUnit: 'Box',
        issueUnit: 'Piece',
        conversionFactor: 100,
        minStock: 1000,
        reorderPoint: 2500,
        reorderQuantity: 10000,
        unitCost: 4.00,
        mrp: 8.00,
        requiresExpiry: true,
        requiresBatch: true
      },
      {
        sku: 'SUR-GLV-075',
        barcode: '890123450004',
        name: 'Surgical Sterile Gloves Size 7.5',
        genericName: 'Latex Surgical Gloves',
        itemType: 'SURGICAL',
        category: 'Surgical > Gloves',
        brand: 'Kanam Latex',
        manufacturer: 'Kanam Latex Labs',
        purchaseUnit: 'Box',
        issueUnit: 'Pair',
        conversionFactor: 50,
        minStock: 300,
        reorderPoint: 800,
        reorderQuantity: 3000,
        unitCost: 22.00,
        mrp: 35.00,
        requiresExpiry: true,
        requiresBatch: true
      },
      {
        sku: 'EQP-PUM-INF',
        barcode: '890123450005',
        name: 'Volumetric Infusion Pump Model X200',
        genericName: 'Infusion Pump',
        itemType: 'EQUIPMENT',
        category: 'Equipment > ICU Equipment',
        brand: 'B. Braun',
        manufacturer: 'B. Braun Medical',
        purchaseUnit: 'Piece',
        issueUnit: 'Piece',
        conversionFactor: 1,
        minStock: 2,
        reorderPoint: 5,
        reorderQuantity: 10,
        unitCost: 45000.00,
        mrp: 65000.00,
        requiresSerial: true,
        requiresExpiry: false,
        requiresBatch: false
      }
    ]);

    // 4. Seed Batches (FEFO demonstration data)
    const now = new Date();
    const expiryNear = new Date();
    expiryNear.setDate(now.getDate() + 45); // Near expiry in 45 days

    const expiryFar1 = new Date();
    expiryFar1.setFullYear(now.getFullYear() + 2); // Expiry in 2 years

    const expiryFar2 = new Date();
    expiryFar2.setFullYear(now.getFullYear() + 3); // Expiry in 3 years

    await Batch.create([
      {
        productId: products[0]._id,
        productSku: products[0].sku,
        productName: products[0].name,
        batchNumber: 'BAT-PAR-2026A',
        manufactureDate: new Date('2025-01-10'),
        expiryDate: expiryNear, // FEFO Priority 1 (Earliest expiry!)
        quantityReceived: 2000,
        currentQuantity: 800,
        unitCost: 2.50,
        mrp: 5.00,
        warehouseName: 'Central Store',
        qualityStatus: 'APPROVED',
        status: 'AVAILABLE'
      },
      {
        productId: products[0]._id,
        productSku: products[0].sku,
        productName: products[0].name,
        batchNumber: 'BAT-PAR-2026B',
        manufactureDate: new Date('2026-02-01'),
        expiryDate: expiryFar1, // FEFO Priority 2
        quantityReceived: 5000,
        currentQuantity: 4500,
        unitCost: 2.50,
        mrp: 5.00,
        warehouseName: 'Central Store',
        qualityStatus: 'APPROVED',
        status: 'AVAILABLE'
      },
      {
        productId: products[1]._id,
        productSku: products[1].sku,
        productName: products[1].name,
        batchNumber: 'BAT-AMO-901',
        manufactureDate: new Date('2026-03-15'),
        expiryDate: expiryFar2,
        quantityReceived: 1000,
        currentQuantity: 950,
        unitCost: 18.00,
        mrp: 26.50,
        warehouseName: 'Central Store',
        qualityStatus: 'APPROVED',
        status: 'AVAILABLE'
      }
    ]);

    // 5. Seed Inventory Balances
    await InventoryBalance.create([
      {
        productId: products[0]._id,
        productSku: products[0].sku,
        productName: products[0].name,
        warehouseName: 'Central Store',
        availableQty: 5300,
        unitCost: 2.50,
        totalStockValue: 13250
      },
      {
        productId: products[1]._id,
        productSku: products[1].sku,
        productName: products[1].name,
        warehouseName: 'Central Store',
        availableQty: 950,
        unitCost: 18.00,
        totalStockValue: 17100
      },
      {
        productId: products[2]._id,
        productSku: products[2].sku,
        productName: products[2].name,
        warehouseName: 'Central Store',
        availableQty: 12000,
        unitCost: 4.00,
        totalStockValue: 48000
      }
    ]);

    // 6. Seed Suppliers
    await Supplier.create([
      {
        code: 'SUP-GSK-01',
        name: 'GSK Pharmaceuticals Ltd.',
        contactPerson: 'Arun Sharma',
        email: 'arun.sharma@gsk.com',
        phone: '+91 98765 43210',
        address: 'Worli, Mumbai, MH',
        gstNumber: '27AAACG1234H1Z5',
        drugLicenseNo: 'DL-MH-2024-991',
        rating: 4.9,
        categoriesSupplied: ['Medicines', 'Antibiotics']
      },
      {
        code: 'SUP-HMD-02',
        name: 'Hindustan Syringes & Medical Devices',
        contactPerson: 'Vikram Malhotra',
        email: 'v.malhotra@hmd.com',
        phone: '+91 98111 22334',
        address: 'Faridabad, HR',
        gstNumber: '06AAACH4321K1Z2',
        rating: 4.7,
        categoriesSupplied: ['Consumables', 'Syringes']
      }
    ]);

    // 7. Seed Indents & POs
    await Indent.create({
      indentNumber: 'IND-2026-101',
      departmentName: 'ICU Ward',
      requestingStore: 'ICU Store',
      targetStore: 'Central Store',
      requestedBy: 'Nurse Maria Santos',
      priority: 'URGENT',
      items: [
        {
          productId: products[0]._id,
          productSku: products[0].sku,
          productName: products[0].name,
          requestedQty: 200,
          issuedQty: 0
        },
        {
          productId: products[1]._id,
          productSku: products[1].sku,
          productName: products[1].name,
          requestedQty: 50,
          issuedQty: 0
        }
      ],
      status: 'PENDING_APPROVAL',
      remarks: 'Post-op patient surge emergency indent'
    });

    await PurchaseOrder.create({
      poNumber: 'PO-2026-881',
      supplierName: 'GSK Pharmaceuticals Ltd.',
      requestedBy: 'David Vance',
      subTotal: 50000,
      taxAmount: 6000,
      totalAmount: 56000,
      status: 'SUBMITTED',
      items: [
        {
          productId: products[1]._id,
          productSku: products[1].sku,
          productName: products[1].name,
          orderedQty: 2000,
          unitCost: 18.00,
          taxRate: 12,
          totalCost: 36000
        }
      ]
    });

    // 8. Seed Serial Assets
    await SerialNumber.create([
      {
        productId: products[4]._id,
        productName: products[4].name,
        serialNumber: 'INF-PUMP-2026-001',
        status: 'IN_USE',
        warehouseName: 'ICU Store',
        assignedDepartment: 'ICU Ward',
        assignedUser: 'Nurse Maria Santos',
        warrantyStart: new Date('2025-01-01'),
        warrantyEnd: new Date('2027-01-01'),
        lastServiceDate: new Date('2026-01-15'),
        nextServiceDate: new Date('2026-07-15')
      }
    ]);

    await AuditLog.create({
      action: 'SYSTEM_SEEDED',
      module: 'SYSTEM',
      performedBy: 'System Auto-Init',
      userRole: 'SUPER_ADMIN',
      details: 'Populated production-grade initial hospital inventory dataset.'
    });

    console.log('Hospital Inventory initial database seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seedDatabase;
