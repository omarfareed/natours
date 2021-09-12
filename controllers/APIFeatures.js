class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    const queryObj = { ...this.queryStr };
    ['page', 'sort', 'limit', 'fields'].forEach(el => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lte?|gte?)\b/gi, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryStr.sort)
      this.query = this.query.sort(this.queryStr.sort.split(',').join(' '));
    else this.query = this.query.sort('-createdAt');
    return this;
  }
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // excluding it
    }
    return this;
  }
  paginate() {
    const page = +this.queryStr.page || 1,
      limit = +this.queryStr.limit || 100,
      skip = (page - 1) * limit;


    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
