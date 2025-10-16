const { model } = require("mongoose");

class MixGameController {

    create = asyncHandler(async(req,res)=>{

            const { title, questions, options, correctOption, gameType, ageGroup, subjectKit } = req.body;
        
    });
}
module.exports = new MixGameController();