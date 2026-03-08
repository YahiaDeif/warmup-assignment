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

function addShiftRecord(textFile,shiftObj){

    let data=fs.readFileSync(textFile,"utf8").trim()
    let rows=data?data.split("\n"):[]

    for(let r of rows){
        let cols=r.split(",")
        if(cols[0]===shiftObj.driverID && cols[2]===shiftObj.date)
            return {}
    }

    let shiftDuration=getShiftDuration(shiftObj.startTime,shiftObj.endTime)
    let idleTime=getIdleTime(shiftObj.startTime,shiftObj.endTime)
    let activeTime=getActiveTime(shiftDuration,idleTime)
    let quota=metQuota(shiftObj.date,activeTime)

    let newObj={
        ...shiftObj,
        shiftDuration,
        idleTime,
        activeTime,
        metQuota:quota,
        hasBonus:false
    }

    let newRow=[
        newObj.driverID,
        newObj.driverName,
        newObj.date,
        newObj.startTime,
        newObj.endTime,
        shiftDuration,
        idleTime,
        activeTime,
        quota,
        false
    ].join(",")

    rows.push(newRow)

    fs.writeFileSync(textFile,rows.join("\n"))

    return newObj
}

function setBonus(textFile,driverID,date,newValue){

    let rows=fs.readFileSync(textFile,"utf8").trim().split("\n")

    for(let i=0;i<rows.length;i++){
        let cols=rows[i].split(",")

        if(cols[0]===driverID && cols[2]===date){
            cols[9]=String(newValue)
            rows[i]=cols.join(",")
        }
    }

    fs.writeFileSync(textFile,rows.join("\n"))
}

function countBonusPerMonth(textFile, driverID, month) {

    let rows = fs.readFileSync(textFile, "utf8").trim().split("\n");

    let found = false;
    let count = 0;

    month = String(month).padStart(2, "0");

    for (let row of rows) {

        let cols = row.split(",");

        if (cols[0] === driverID) {
            found = true;

            let recordMonth = cols[2].split("-")[1];

            let bonusValue = cols[9].trim().toLowerCase();

            if (recordMonth === month && bonusValue === "true") {
                count++;
            }
        }
    }

    if (!found) return -1;

    return count;
}

function getTotalActiveHoursPerMonth(textFile,driverID,month){

    let rows=fs.readFileSync(textFile,"utf8").trim().split("\n")

    let total=0

    for(let r of rows){

        let c=r.split(",")

        if(c[0]===driverID){

            let m=Number(c[2].split("-")[1])

            if(m===month)
                total+=parseHMS(c[7])
        }
    }

    return formatTime(total)
}

function getRequiredHoursPerMonth(textFile,rateFile,bonusCount,driverID,month){

    let shifts=fs.readFileSync(textFile,"utf8").trim().split("\n")
    let rates=fs.readFileSync(rateFile,"utf8").trim().split("\n")

    let dayOff=""

    for(let r of rates){
        let c=r.split(",")
        if(c[0]===driverID)
            dayOff=c[1]
    }

    let total=0

    for(let r of shifts){

        let c=r.split(",")

        if(c[0]!==driverID) continue

        let date=c[2]
        let m=Number(date.split("-")[1])

        if(m!==month) continue

        let day=new Date(date).toLocaleDateString("en-US",{weekday:"long"})

        if(day===dayOff) continue

        if(date>="2025-04-10" && date<="2025-04-30")
            total+=parseHMS("6:00:00")
        else
            total+=parseHMS("8:24:00")
    }

    total-=bonusCount*2*3600

    return formatTime(total)
}

function getNetPay(driverID,actualHours,requiredHours,rateFile){

    let rows=fs.readFileSync(rateFile,"utf8").trim().split("\n")

    let basePay=0
    let tier=0

    for(let r of rows){
        let c=r.split(",")
        if(c[0]===driverID){
            basePay=Number(c[2])
            tier=Number(c[3])
        }
    }

    let allowance=[0,50,20,10,3][tier]

    let actual=parseHMS(actualHours)
    let required=parseHMS(requiredHours)

    if(actual>=required) return basePay

    let missing=(required-actual)/3600

    missing=Math.floor(missing-allowance)

    if(missing<0) missing=0

    let deductionRate=Math.floor(basePay/185)

    return basePay-missing*deductionRate
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
