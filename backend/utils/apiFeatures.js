class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    /**
     * Search functionality (REGEX Search)
     * Target: Vendor Name
     */
    search() {
        if (this.queryStr.search) {
            const keyword = {
                name: {
                    $regex: this.queryStr.search,
                    $options: "i",
                },
            };
            this.query = this.query.find({ ...keyword });
        }
        return this;
    }

    /**
     * Filter functionality
     * Handles: status, city (mapped to address.city)
     */
    filter() {
        const queryCopy = { ...this.queryStr };

        // Exclude specific fields from filtering logic
        const removeFields = ["search", "sort", "page", "limit"];
        removeFields.forEach((key) => delete queryCopy[key]);

        // Support for nested 'city' filter
        if (queryCopy.city) {
            queryCopy["address.city"] = queryCopy.city;
            delete queryCopy.city;
        }

        // Advanced filter for comparisons (gt, gte, etc)
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    /**
     * Sorting functionality
     * Default: Latest created first
     */
    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }

    /**
     * Pagination functionality
     */
    paginate() {
        const page = parseInt(this.queryStr.page, 10) || 1;
        const limit = parseInt(this.queryStr.limit, 10) || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;
