import cron from 'node-cron';
import roiHistoryService from './services/roiHistory.service.js';
import referrelLevelIncomeService from './services/referralLevelIncome.service.js';

cron.schedule('1 0 * * *', async() => {
    try {
      console.log("Daily Roi Processing Started...");
      const rois = await roiHistoryService.processAllDailyRoi();
      console.log(`All ${rois.length} Roi Processed`);  
      const rlis = await referrelLevelIncomeService.processAllReferralLevelIncome();
      console.log(`${rlis.length} referrel income distributed`);
      
    } catch (error) {
        console.error(`Error while process daily Roi:${error}`);
    }
 },{timezone:'Asia/Kolkata'});