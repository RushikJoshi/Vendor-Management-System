const Quotation = require("../../../models/Quotation");
const Vendor = require("../../../models/vendor.model");

class ComparisonEngineService {
  static normalize(value, min, max) {
    if (max === min) return 1;
    return (value - min) / (max - min);
  }

  static async buildComparisonMatrix({ rfqId, tenantId }) {
    const quotations = await Quotation.find({ rfqId, tenantId }).lean();
    if (!quotations.length) return [];

    const amounts = quotations.map((q) => Number(q.totalAmount || 0));
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);

    const vendorIds = quotations.map((q) => q.vendorId);
    const vendors = await Vendor.find({ _id: { $in: vendorIds }, tenantId }).select("rating companyName name").lean();
    const vendorMap = vendors.reduce((acc, item) => {
      acc[String(item._id)] = item;
      return acc;
    }, {});

    return quotations
      .map((quotation) => {
        const vendor = vendorMap[String(quotation.vendorId)] || {};
        const vendorRating = Number(vendor.rating || 0);
        const costScore = 1 - this.normalize(Number(quotation.totalAmount || 0), minAmount, maxAmount);
        const ratingScore = Math.min(vendorRating / 5, 1);
        const finalScore = Number((costScore * 0.7 + ratingScore * 0.3).toFixed(4));

        return {
          quotationId: quotation._id,
          vendorId: quotation.vendorId,
          vendorName: vendor.companyName || vendor.name || "Vendor",
          totalAmount: quotation.totalAmount,
          currency: "INR",
          scoreBreakdown: {
            costScore: Number(costScore.toFixed(4)),
            ratingScore: Number(ratingScore.toFixed(4)),
          },
          finalScore,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);
  }
}

module.exports = ComparisonEngineService;
