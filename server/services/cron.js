const cron = require("node-cron")
const { rotateKey, cleanupOldKeys } = require("./dbKeyStore")


const initCronJobs = () => {
    cron.schedule("0 0 1 * *", async () => {
        console.log("[Cron] Rotating Keys...")
        try {
            await rotateKey()
            console.log("[Cron] Keys rotated successfully")
        } catch (error) {
            console.error("[Cron] Error Rotating Keys", error)
        }
    })
    cron.schedule("0 0 * * *", async () => {
        console.log("[Cron] Cleaning up keys...")
        try {
            await cleanupOldKeys(30)
            console.log("[Cron] Keys cleaned up successfully")
        } catch (error) {
            console.error("[Cron] Error cleaning up keys", error)
        }
    })
    console.log("[Cron] Cron jobs initialized")
}
module.exports = initCronJobs
