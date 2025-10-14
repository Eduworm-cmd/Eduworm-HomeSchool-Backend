const ageGroupModel = require("../models/ageGroup.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

class AgeGroupController {
  createAgeGroup = asyncHandler(async (req, res) => {
    const { min, max } = req.body;

    if (min === undefined || max === undefined) {
      throw new ApiError(400, 'Min and Max age are required');
    }

    const minAge = parseInt(min);
    const maxAge = parseInt(max);

    if (!Number.isInteger(minAge) || !Number.isInteger(maxAge)) {
      throw new ApiError(400, 'Min and Max must be valid numbers');
    }

    if (minAge < 0 || maxAge < 0) {
      throw new ApiError(400, 'Ages must be non-negative');
    }

    if (minAge > maxAge) {
      throw new ApiError(400, 'Min age cannot be greater than Max age');
    }

    const name = `${minAge}-${maxAge} Years`;

    const ageGroupExists = await ageGroupModel.findOne({ name });

    if (ageGroupExists) {
      throw new ApiError(400, 'Age Group already exists');
    }

    const ageGroup = await ageGroupModel.create({
      min: minAge,
      max: maxAge,
      name
    });

    res
      .status(201)
      .json(new ApiResponse(201, ageGroup, 'Age Group Created Successfully'));
  });


  getAllAgeGroup = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 100) {
      throw new ApiError(400, 'Page must be >= 1 and limit must be between 1 and 100');
    }

    const skip = (page - 1) * limit;
    const { name } = req.query;

    const filter = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' }; 
    }

    const [allAgeGroup, totalAgeGroup] = await Promise.all([
      ageGroupModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      ageGroupModel.countDocuments(filter)
    ]);

    return res.status(200).json(new ApiResponse(
      200,
      {
        totalAgeGroup,
        page,
        limit,
        pages: Math.ceil(totalAgeGroup / limit),
        results: allAgeGroup,
      },
      totalAgeGroup === 0 ? 'No Age Group data found' : 'All Age Group fetched successfully'
    ));
  });
}

module.exports = new AgeGroupController();
