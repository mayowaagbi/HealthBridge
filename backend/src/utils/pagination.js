const paginateResults = (model) => async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;

  try {
    const results = await model.findMany({
      skip: startIndex,
      take: limit,
    });

    const total = await model.count();

    res.paginatedResults = {
      data: results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };

    next();
  } catch (error) {
    next(error);
  }
};
module.exports = { paginateResults };
