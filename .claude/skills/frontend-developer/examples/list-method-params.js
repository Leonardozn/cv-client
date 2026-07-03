/**
 * list-method-params.js
 *
 * Complete examples of all possible parameters for the `GET` (list) methods
 * executed from the Frontend using Axios, targeting the Easy Node Backend.
 *
 * These parameters are parsed by the backend and passed into the repository's `list` method:
 *  - query (Search filters & advanced operators)
 *  - virtuals (Field projection)
 *  - relations (Populate/lookup references)
 *  - size (Pagination: records per page)
 *  - page (Pagination: page number)
 *  - sort (Ordering: { field, type })
 *
 * Usage with Axios (via apiMethods):
 *   apiMethods.GET_INGREDIENT_LIST.method({
 *     query: { ... },
 *     virtuals: { ... },
 *     relations: { ... },
 *     size: 10,
 *     page: 1,
 *     sort: { field: "name", type: 1 }
 *   });
 *
 * NOTE: When nesting objects inside `params` in Axios, ensure your Axios instance
 * uses a paramsSerializer (like the `qs` library) to correctly format the URLs,
 * especially for deep objects and arrays!
 */

// ╔══════════════════════════════════════════════════════════════════╗
// ║  1. QUERY — Direct match (no advanced operators)                 ║
// ╚══════════════════════════════════════════════════════════════════╝

// 1.1 No filters — returns all records
const queryEmpty = {};

// 1.2 Exact match on a string field
const queryByName = { query: { name: "Harina" } };

// 1.3 Exact match on a number field
const queryByStock = { query: { stock: 100 } };

// 1.4 Exact match on a boolean field
const queryByTaxInclude = { query: { tax_include: true } };

// 1.5 Exact match on ObjectId fields (requires equality only, no allowAdvance on backend)
const queryByUnit = { query: { unit: "60c72b2f9b1d8e001c8e4abc" } };
const queryByCategory = { query: { category: "60c72b2f9b1d8e001c8e4def" } };

// 1.6 Combination of multiple direct filters
const queryMultipleDirectFilters = {
  query: {
    category: "60c72b2f9b1d8e001c8e4def",
    tax_include: true,
  },
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║  2. QUERY — Advanced operators on STRING fields (name)           ║
// ╚══════════════════════════════════════════════════════════════════╝

// 2.1 eq → equal to
const queryNameEq = { query: { name: { eq: "Sal" } } };

// 2.2 ne → not equal to
const queryNameNe = { query: { name: { ne: "Azucar" } } };

// 2.3 like → contains (case insensitive)
const queryNameLike = { query: { name: { like: "har" } } };

// 2.4 notLike → does not contain
const queryNameNotLike = { query: { name: { notLike: "aceite" } } };

// 2.5 in → within a list of values
const queryNameIn = { query: { name: { in: ["Sal", "Azucar", "Harina"] } } };

// 2.6 notIn → not within a list of values
const queryNameNotIn = { query: { name: { notIn: ["Sal", "Azucar"] } } };

// 2.7 or → matches any of the values (multiple)
const queryNameOr = { query: { name: { or: ["Sal", "Harina"] } } };

// 2.8 or with nested operators
const queryNameOrWithOperators = {
  query: {
    name: {
      or: [{ like: "sal" }, { like: "azucar" }],
    },
  },
};

// 2.9 or mixed (literal value + object with operator)
const queryNameOrMixed = {
  query: {
    name: {
      or: ["Sal", { like: "har" }],
    },
  },
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║  3. QUERY — Advanced operators on NUMBER fields                  ║
// ╚══════════════════════════════════════════════════════════════════╝

// 3.1 eq / ne
const queryStockEq = { query: { stock: { eq: 50 } } };
const queryStockNe = { query: { stock: { ne: 0 } } };

// 3.2 gt / gte (greater than / greater than or equal to)
const queryStockGt = { query: { stock: { gt: 10 } } };
const queryStockGte = { query: { stock: { gte: 5 } } };

// 3.3 lt / lte (less than / less than or equal to)
const queryCostLt = { query: { cost: { lt: 100 } } };
const queryCostLte = { query: { cost: { lte: 200.5 } } };

// 3.4 between / notBetween → inclusive range [min, max]
const queryStockBetween = { query: { stock: { between: [10, 100] } } };
const queryStockNotBetween = { query: { stock: { notBetween: [0, 5] } } };

// 3.5 in / notIn
const queryStockIn = { query: { stock: { in: [10, 20, 50] } } };
const queryCostNotIn = { query: { cost: { notIn: [0, 1, 2] } } };

// 3.6 or with numbers
const queryStockOr = { query: { stock: { or: [10, 20, 50] } } };
const queryStockOrWithOperators = {
  query: {
    stock: {
      or: [{ gte: 50 }, { lte: 5 }],
    },
  },
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║  4. QUERY — Advanced operators on BOOLEAN fields                 ║
// ╚══════════════════════════════════════════════════════════════════╝

const queryTaxIncludeEq = { query: { tax_include: { eq: true } } };
const queryTaxIncludeOr = { query: { tax_include: { or: [true, false] } } };

// ╔══════════════════════════════════════════════════════════════════╗
// ║  5. QUERY — Advanced operators on ObjectId field (_id)           ║
// ╚══════════════════════════════════════════════════════════════════╝

const queryIdEq = { query: { _id: { eq: "60c72b2f9b1d8e001c8e4a01" } } };
const queryIdIn = {
  query: {
    _id: {
      in: ["60c72b2f9b1d8e001c8e4a01", "60c72b2f9b1d8e001c8e4a02"],
    },
  },
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║  6. QUERY — Combinations of multiple fields                      ║
// ╚══════════════════════════════════════════════════════════════════╝

const queryCombined = {
  query: {
    name: { like: "sal" },
    stock: { gte: 10 },
    category: "60c72b2f9b1d8e001c8e4def",
    cost: { between: [50, 500] },
    tax_include: true,
  },
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║  7. VIRTUALS — Field projection                                  ║
// ╚══════════════════════════════════════════════════════════════════╝
// Only the selected fields will be returned. Value MUST be '1' or 1.

const virtualsByNameStock = { virtuals: { name: "1", stock: "1" } };
const virtualsByIdName = { virtuals: { _id: "1", name: "1" } };

// ╔══════════════════════════════════════════════════════════════════╗
// ║  8. RELATIONS — Populate (lookup) of ObjectId references         ║
// ╚══════════════════════════════════════════════════════════════════╝
// Will populate the full object for the specified relations.

const relationsUnitCategory = {
  relations: {
    unit: "1",
    category: "1",
    tax_rate: "1",
  },
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║  9. PAGINATION AND SORTING                                       ║
// ╚══════════════════════════════════════════════════════════════════╝

const sizeAndPage = { size: 10, page: 1 };
const sortByNameAsc = { sort: { field: "name", type: 1 } };
const sortByCostDesc = { sort: { field: "cost", type: -1 } };

// ╔══════════════════════════════════════════════════════════════════╗
// ║ 10. ARRAY FIELDS — Simple primitives                             ║
// ╚══════════════════════════════════════════════════════════════════╝
// Matches any element inside a simple array field.

const queryArraySimpleEq = { query: { tags: "promo" } };
const queryArraySimpleMultiple = { query: { tags: { in: ["promo", "new"] } } };
const queryArraySimpleGt = { query: { scores: { gt: 8 } } };
const queryArraySimpleBetween = { query: { scores: { between: [5, 10] } } };

// ╔══════════════════════════════════════════════════════════════════╗
// ║ 11. ARRAY FIELDS — Object Content type (Subdocuments)            ║
// ╚══════════════════════════════════════════════════════════════════╝
// Matches any subdocument within an array that fulfills the conditions

// 11.1 Subdocument Exact Match
const queryDishByIngredient = {
  query: {
    ingredients: {
      ingredient: "60c72b2f9b1d8e001c8e4abc",
    },
  },
};

// 11.2 Subdocument Advanced operator
const queryDishIngredientAmountGte = {
  query: {
    ingredients: {
      amount: { gte: 3 },
    },
  },
};

// 11.3 Subdocument - Combining subfields
const queryPurchaseItemCombined = {
  query: {
    items: {
      item: "60c72b2f9b1d8e001c8e4abc",
      cost: { gte: 50 },
      total: { lte: 800 },
    },
  },
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║ 12. FULL EXAMPLES (Real-world search payload)                    ║
// ╚══════════════════════════════════════════════════════════════════╝

// 12.1 — Search "Harina" with pagination, relations, and projection
const paramsFullExample1 = {
  query: { name: { like: "harina" } },
  virtuals: { name: "1", stock: "1", category: "1", unit: "1" },
  relations: { category: "1", unit: "1" },
  size: 10,
  page: 1,
  sort: { field: "stock", type: -1 },
};

// 12.2 — Get Expensive items + Relation to Tax Rate
const paramsFullExample2 = {
  query: {
    cost: { gte: 200 },
    tax_include: true,
  },
  relations: { tax_rate: "1" },
  size: 50,
  page: 1,
  sort: { field: "cost", type: -1 },
};

// 12.3 — Nested Advanced filter with Object Arrays
const paramsFullExample3 = {
  query: {
    provider: "60c72b2f9b1d8e001c8e4abc",
    items: {
      cost: { between: [100, 1000] },
    },
    total: { gte: 5000 },
  },
  virtuals: {},
  relations: { provider: "1", purchase_state: "1" },
  size: 25,
  page: 1,
  sort: { field: "total", type: -1 },
};

// ╔══════════════════════════════════════════════════════════════════╗
// ║ 13. EXECUTION INSIDE COMPONENT                                   ║
// ╚══════════════════════════════════════════════════════════════════╝

/*
import apiMethods from "../../../config/controllers/enode-restaurant";

const handleLoadData = async () => {
  const params = {
    query: { category: "60c72b2f9b1d8e001c8e4def" },
    relations: { unit: "1" },
    size: 10,
    page: 2
  };

  try {
    const res = await apiMethods.GET_INGREDIENT_LIST.method(params);
    // res.count   -> Total records matching the query
    // res.records -> Array of items matching pagination/filter
    console.log(res);
  } catch (err) {
    console.error(err);
  }
};
*/
