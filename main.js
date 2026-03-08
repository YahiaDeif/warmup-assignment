const fs = require("fs")

function parseTime12(t){
    let [time, period] = t.split(" ")
    let [h,m,s] = time.split(":").map(Number)

    if(period==="pm" && h!==12) h+=12
    if(period==="am" && h===12) h=0

    return h*3600+m*60+s
}

function formatTime(sec){
    let h = Math.floor(sec/3600)
    let m = Math.floor((sec%3600)/60)
    let s = sec%60

    m = String(m).padStart(2,"0")
    s = String(s).padStart(2,"0")

    return `${h}:${m}:${s}`
}

function parseHMS(t){
    let [h,m,s] = t.split(":").map(Number)
    return h*3600+m*60+s
}

function getShiftDuration(startTime,endTime){
    let start=parseTime12(startTime)
    let end=parseTime12(endTime)
    return formatTime(end-start)
}

function getIdleTime(startTime,endTime){
    let start=parseTime12(startTime)
    let end=parseTime12(endTime)

    let startDelivery=parseTime12("8:00:00 am")
    let endDelivery=parseTime12("10:00:00 pm")

    let idle=0

    if(start < startDelivery)
        idle += Math.min(end,startDelivery)-start

    if(end > endDelivery)
        idle += end-Math.max(start,endDelivery)

    return formatTime(idle)
}

function getActiveTime(shiftDuration,idleTime){
    let shift=parseHMS(shiftDuration)
    let idle=parseHMS(idleTime)
    return formatTime(shift-idle)
}

function metQuota(date,activeTime){

    let active=parseHMS(activeTime)

    let quota=parseHMS("8:24:00")

    if(date>="2025-04-10" && date<="2025-04-30")
        quota=parseHMS("6:00:00")

    return active>=quota
}
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
