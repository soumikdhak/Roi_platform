export const getLastSevenDaysDate = ():(string)[]=> {
const lastSevenDays = [];

for (let i = 1; i < 8; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dateValiDate = date.toISOString().split('T')[0];
    
    lastSevenDays.push(typeof dateValiDate === 'string'?dateValiDate:''); 
}

return lastSevenDays;
}

//console.log(getLastSevenDaysDate());

