const prisma = require("../lib/prisma")
const { generateKeyPair, exportSPKI, exportPKCS8, exportJWK, importSPKI, importPKCS8 } = require("jose")
const { randomUUID } = require("crypto")
async function rotateKey() {
    await prisma.$transaction(async (tx) => {
        await tx.keyStore.updateMany({
            where: {
                active: true
            },
            data: {
                active: false
            }
        })
    })
    const kid = randomUUID()
    const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true })
    const exportPublicKey = await exportSPKI(publicKey)
    const exportPrivateKey = await exportPKCS8(privateKey)
    await prisma.keyStore.create({
        data: {
            kid,
            publicKey: exportPublicKey,
            privateKey: exportPrivateKey,
            active: true,
        }
    })
    console.log(`[KeyStore] rotated key ${kid}`)
}

async function getSigningKey() {
    const key = await prisma.keyStore.findFirst({
        where: {
            active: true
        }
    })
    if (!key) {
        throw new Error("No active key found")
    }
    const privateKey = await importPKCS8(key.privateKey, "RS256")
    return { privateKey, kid: key.kid }
}

async function getJwks() {
    const keys = await prisma.keyStore.findMany()
    return await Promise.all(keys.map(async (key) => {
        const publicKey = await importSPKI(key.publicKey, "RS256")
        const jwk = await exportJWK(publicKey)
        jwk.kid = key.kid
        jwk.use = "sig"
        jwk.alg = "RS256"
        return jwk
    }))
}

async function cleanupOldKeys(maxAge) {
    const threshold = new Date(Date.now() - maxAge)
    const result = await prisma.keyStore.deleteMany({
        where:
        {
            createdAt: {
                lt: threshold
            }
        }
    })
    console.log(`[KeyStore] cleaned up ${result.count} keys older than ${maxAge}ms`)
}

async function deleteKeys() {
    const result = await prisma.keyStore.deleteMany()
    console.log(`[KeyStore] deleted ${result.count} keys`)
}
module.exports = {
    rotateKey,
    getSigningKey,
    getJwks,
    cleanupOldKeys,
    deleteKeys
}
