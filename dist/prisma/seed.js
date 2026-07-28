"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@diskominfo.go.id' },
        update: {},
        create: {
            email: 'admin@diskominfo.go.id',
            name: 'Administrator',
            password: adminPassword,
            role: client_1.Role.ADMIN,
        },
    });
    const user = await prisma.user.upsert({
        where: { email: 'user@diskominfo.go.id' },
        update: {},
        create: {
            email: 'user@diskominfo.go.id',
            name: 'Pengguna Biasa',
            password: userPassword,
            role: client_1.Role.USER,
        },
    });
    console.log(`Users created: ${admin.email}, ${user.email}`);
    const productsData = [
        { name: 'Laptop Asus ROG Strix G16', price: 25000000 },
        { name: 'Monitor LG UltraGear 27 Inch 144Hz', price: 4500000 },
        { name: 'Keyboard Mechanical Keychron K2', price: 1250000 },
        { name: 'Mouse Wireless Logitech MX Master 3S', price: 1500000 },
        { name: 'Headphone Wireless Sony WH-1000XM5', price: 4999000 },
        { name: 'Webcam Logitech C920 HD Pro', price: 1100000 },
        { name: 'Desk Pad Kulit Premium', price: 250000 },
    ];
    for (const prod of productsData) {
        const p = await prisma.product.create({
            data: prod,
        });
        console.log(`Product created: ${p.name} (ID: ${p.id}, Rp ${p.price.toLocaleString('id-ID')})`);
    }
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map