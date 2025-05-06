---
title: "Mongo DB"
summary: "Curated Mongo DB problems"
image: ""
publishedAt: "2025-05-06"
---


# Aggregation Pipeline :
---
```
- Basically inside array you'll have objects that will act as a src of the next operation
 [
	 {},
	 {},...
 ]
```
---
### $match , $group`

```js
db.posts.aggregate([
  // Stage 1: Only find documents that have more than 1 like
  {
    $match: { likes: { $gt: 1 } } // like where clause in sql
  },
  // Stage 2: Group documents by category and sum each categories likes
  {
    $group: { _id: "$category", totalLikes: { $sum: "$likes" } }
  }
])
```
---
### $sort , $project ,  $limit
```js
db.listingsAndReviews.aggregate([
  {
    $sort: { "accommodates": -1 }  // 1 -> ASC, -1 -> DESC
  },
  {
  // We use a `1` to include a field and `0` to exclude a field.
  //
    $project: { // This will return the documents but only include the specified fields.
      "name": 1,
      "accommodates": 1
    }
  },
  {
    $limit: 5 // returns 5 records from collection
  }
])
```
---
### $count
```js
db.restaurants.aggregate([
  {
    $match: { "cuisine": "Chinese" }
  },
  {
    $count: "totalChinese"
  }
])
```
---
### $addFields, $avg

```js
db.restaurants.aggregate([
  {
	// Adds a new field to each document in the restaurants collection.
    $addFields: {
      avgGrade: { $avg: "$grades.score" } // $grades.score refers to the score field within the grades array for each restaurant document.
    }
  },
  {
    $project: {
      "name": 1,
      "avgGrade": 1
    }
  },
  {
    $limit: 5
  }
])
```
- This will return the documents along with a new field, `avgGrade`, which will contain the average of each restaurants `grades.score`.
- Example:
If a restaurant document looks like this:
```json
{
  "name": "Restaurant A",
  "grades": [
    { "score": 85 },
    { "score": 90 },
    { "score": 78 }
  ]
}
```
After applying $addFields, it will be transformed to:
```json
{
  "name": "Restaurant A",
  "grades": [
    { "score": 85 },
    { "score": 90 },
    { "score": 78 }
  ],
  "avgGrade": 84.33 // Here, avgGrade is the average of the scores 85, 90, and 78.
}
```

---
### $lookup
This aggregation stage performs a left outer join to a collection in the same database.

There are four required fields:

- `from`: This specifies the collection you want to join with -> This is where I'll look from
- `localField`: The field in the primary collection that can be used as a unique identifier in the `from` collection.
- `foreignField`: The field in the `from` collection that can be used as a unique identifier in the primary collection.
- `as`: The name of the new field that will contain the matching documents from the `from` collection.
```js
db.comments.aggregate([
  {
    $lookup: {
      from: "movies", // other/movies db
      localField: "movie_id", // name in comments db
      foreignField: "_id", // name in movies db
      as: "movie_details", // this is create an array with one object containing corresponding movie details
    },
  },
  {
    $unwind: "$movie_details", // This will convert the array into a single object
  },
  {
    $limit: 1
  }
])
// This will return the movie data along with each comment.
```
- `$unwind`
```js
// without unwind
{
  "_id": ObjectId("..."),
  "comment_text": "This is a comment",
  "movie_id": ObjectId("..."),
  "movie_details": [
    {
      "_id": ObjectId("..."),
      "title": "Movie Title",
      "director": "Director Name",
      ...
    }
  ]
}
```
```js
// with $unwind
{
  "_id": ObjectId("..."),
  "comment_text": "This is a comment",
  "movie_id": ObjectId("..."),
  "movie_details": {
    "_id": ObjectId("..."),
    "title": "Movie Title",
    "director": "Director Name",
    ...
  }
}

```

# MongoDB Indexing/Search

#

# Questions and Solutions
---
- 3 Db -> authors, books, users
```json
// authors
[
    {
      "_id": 100,
      "name": "F. Scott Fitzgerald",
      "birth_year": 1896
    },
    ...
  ]
```
```json
// books
[
    {
      "_id": 1,
      "title": "The Great Gatsby",
      "author_id": 100,
      "genre": "Classic"
    },
    ...
  ]
```
```json
// users -> independent of those 2 databases
[
    {
      "index": NumberInt(0),
      "name": "Aurelia Gonzales",
      "isActive": false,
      "registered": ISODate("2015-02-11T04:22:39+0000"),
      "age": NumberInt(20),
      "gender": "female",
      "eyeColor": "green",
      "favoriteFruit": "banana",
      "company": {
        "title": "YURTURE",
        "email": "aureliagonzales@yurture.com",
        "phone": "+1 (940) 501-3963",
        "location": {
          "country": "USA",
          "address": "694 Hewes Street"
        }
      },
      "tags": [
        "enim",
        "id",
        "velit",
        "ad",
        "consequat"
      ]
    },
    {...}, ...
]
```

#### Q1. How many users are active ?
---
- go to each db and count the number of isActive true
```js
db.users.aggregate([
  {
    $match: {
      isActive: true
    }
  },
  {
    $count: 'activeUsers' // output as -> activeUsers : 516
  }
])
```
- Counts the number of documents that passed through the $match stage and outputs the result with the field name "activeUsers".
- Counts the number of documents that matched the criteria and outputs the result as a single document with the specified field name (in this case, "activeUsers").
- Output:
	```
	[
	  { "activeUsers": 5 }
	]
	```
-  Without Aggregation
```js
db.users.countDocuments({ isActive: true });
```
#### Q2. What is the average age of all users ?
---
- Need to group all users to one document
-
```js
db.users.aggregate([
  {
    $group: {
      _id: null, // No grouping key; we're calculating across all documents
      averageAge: {
        $avg: "$age"
      }
    }
  }
])
// OUTPUT ::
/*
[
  {
    "_id": null,
    "averageAge": 29.835
  }
]
*/
```
- Some other examples of `$group`
- group the document based on gender
```js
db.users.aggregate([
  {
    $group: {
      _id: "$gender"
    }
  }
])
/*
output: 2 documents --------------------
[
  {
    "_id": "male"
  },
  {
    "_id": "female"
  }
]
*/
```

#### Q3. Group users by their favourite fruit and count how many users prefer each type of fruit
---
```js
db.users.aggregate([
	{
		$group: {
			_id:"$favouriteFruit", // group by favouriteFruit
			count:{
				// Adds 1 for each document in the group, effectively counting the number of documents.
				$sum: 1 // Count the number of documents in each group
			}
		}
	}
])

---
// Output
[
  { "_id": "banana", "count": 2 },
  { "_id": "apple", "count": 2 },
  { "_id": "orange", "count": 1 }
]
```
#### Q4. List top 3 common fruits among the users
---
```js
db.users.aggregate([
	{
		$group: {
			_id:"$favouriteFruit", // group by favouriteFruit
			count:{
				// Adds 1 for each document in the group, effectively counting the number of documents.
				$sum: 1 // Count the number of documents in each group
			}
		}
	},
	{
		$sort: {
			// As aggregation, count is now a field, but it is not in db
			count: -1 // highest at top
		}
	},
	{
		$limit: 3
	}
])
---
// Output:
[
  { "_id": "banana", "count": 10 },
  { "_id": "apple", "count": 9 },
  { "_id": "orange", "count": 8 }
]
```
#### Q5. Find the total numbers of males and females
---
```js
db.users.aggregate([
	{
		$group: {
			_id: "$gender",
			count:{
				$sum: 1
			}
		}
	}
])
```

#### Q6. Which country has the highest number of registered users?
---
```js
db.users.aggregate([
	{
		$group: {
			_id: "$company.location.country", // drilling down
			userCount: {
				$sum: 1
			}
		}
	},
	{
		$sort: {
			userCount: -1
		}
	},
	{
		$limit: 1
	}
])
```

#### Q7. List all the unique eye colours present in the collection
---
```js
db.users.aggregate([
	{
		$group: {
			_id: "eyeColor" // ids are uniqie
		}
	}
])
```

#### Q8. Average number of tags per user
---
```js
// *******
"tags": [
	"enim",
	"id",
	"velit",
	"ad",
	"consequat"
]
// *******
// Ex 1 : ---------------------------
db.users.aggregate([
	// if user1 has 2 tags in the array, it'll create two user1 document with each tag as object
	{$unwind: "$tags"}, // destructure the document based on each tags.
	{
		$group: {
			_id: "$_id", // unique identifier of each user
			tagCount: {$sum: 1}
		}
	},
	{
		$group: {
			_id: null,
			averageNumberOfTags: {$avg: "tagCount"}
		}
	}
])
// Ex 2 : --------------------------
db.users.aggregate([
  {
    $addFields: {
      tagCount: {
	      $size: {$ifNull : ["$tags",[]]}
      }  // Add a new field `tagCount` to calculate the size of the `tags` array
    }
  },
  {
    $group: {
      _id: null,                 // No grouping key, calculate for all users
      averageTags: { $avg: "$tagCount" }  // Calculate the average of the tagCount field
    }
  }
])
// Ex 3 ----------------------------
db.users.aggregate([
  {
    $project: {
      tagCount: { $size: "$tags" }  // Calculate the number of tags for each user
    }
  },
  {
    $group: {
      _id: null,                    // No grouping key, calculate for all users
      averageTags: { $avg: "$tagCount" }  // Calculate the average number of tags
    }
  }
])
```
```json
// INPUT
[
  { "index": 0, "name": "Alice", "tags": ["tag1", "tag2"] },
  { "index": 1, "name": "Bob", "tags": ["tag1"] },
  { "index": 2, "name": "Charlie", "tags": ["tag1", "tag2", "tag3"] }
]
// Ex 1 ---------------------
// After pipeline1 (unwind)
[
  { "index": 0, "name": "Alice", "tags": "tag1" },
  { "index": 0, "name": "Alice", "tags": "tag2" },
  { "index": 1, "name": "Bob", "tags": "tag1" },
  { "index": 2, "name": "Charlie", "tags": "tag1" },
  { "index": 2, "name": "Charlie", "tags": "tag2" },
  { "index": 2, "name": "Charlie", "tags": "tag3" }
]
// After pipeline 2 (group 1)
[
  { "_id": 0, "tagCount": 2 },
  { "_id": 1, "tagCount": 1 },
  { "_id": 2, "tagCount": 3 }
]

// Ex 2 -----------------------
// After addFields
[
  { "index": 0, "name": "Alice", "tags": ["tag1", "tag2"], "tagCount": 2 },
  { "index": 1, "name": "Bob", "tags": ["tag1"], "tagCount": 1 },
  { "index": 2, "name": "Charlie", "tags": ["tag1", "tag2", "tag3"], "tagCount": 3 }
]

// Ex 3 ------------------------


// Calc average tags per user
[
  { "_id": null, "averageTags": 2 }
]
// Explanation:
The average is (2 + 1 + 3) / 3 = 6 / 3 = 2.

```

#### Q9. How many users have 'enim' as one of their tags ?
---
- match the tag across all the user then count the users
```js
db.users.aggregate([
	{
		$match: {
			tags: "enim"
		}
	},
	{
		count: "usersWithEnimTag"
	}
])
```

#### Q10. What are the names and age of users who are inactive and have 'velit' as a tag ?
---
```js
[
	{
		$match: {
			isActive: false, // comma acts as AND operator
			tags: "velit",
		}
	},
	{
		$project: {
			// I want only the name and age (filtered)
			name: 1,
			age: 1
		}
	}
]
```
#### Q11. How many users have a phone number starting with '+1 (940) ?'
---
```js
[
	{
		$match : {
			"company.phone": regex (add the regex)
		}
	},
	{
		$count: "NoOfUsersWithSpecialPhoneNumber"
	}
]
```
#### Q12. Who are the 3 users that have registered more recently ?
---
```js
[
	{
		$sort: {
			registered: -1
		}
	},
	{$limit: 3},
	{
		// optional
		$project: {
			name: 1,
			registered: 1
		}
	}
]
```
#### Q13. Categorize users by their favourite fruit
---
- Categorize -> Group
```js
[
	{
		$group: {
			_id: "$favouriteFruit",
			//
			users: [$push: "$name"] // Once I use push, users is now array instead of a field.
		}
	}
]
// OUTPUT:
_id: "apple",
users: Array(89)
---
_id: "banana",
users: Array(100)
```
#### Q14. How many users have "ad" as their 2nd tag in their list of tags ?
---
```js
[
	{
		$match: {
			"tags.1": "ad" // since tags is array, it checks for 2nd element
		}
	},
	{
		$count: 'secondTagAd'
	}
]
```
#### Q15. Find users who have both 'enim' and 'id' as their tags
---
```js
[
	{
		$match: {
			tags: {$all: ["enim", "id"]}
		}
	}
]
```
#### Q16. List all the companies located in the USA with their corresponding user count
---
```js
[
	{
		$match: {
			"company.location.country": "USA"
		}
	},
	{
		$group: {
			_id: "$company.title",
			userCount: {$sum: 1}
		}
	}
]

/*
{
	userCount: 1
	_id: "VERTON"
},
{
	userCount: 2,
	_id: "BLEEKO"
}
...

*/
```
#### Q17. Lookup
---
```js
[
	{
		$lookup: {
			from: "authors",
			localField: "author_id",
			foreignField: "_id",
			as: "author_details"
		}
	},
	// At this point, author_details in authors table is an array with values in indices, but we don;t want array, so
	{
		$unwind: "$author_details" // aggregation thus $ is used in field to refer
	},
	// or
	{
		$addFields: {
			author_details: {
				$arrayElementAt: ["$author_details", 0]
			}
		}
	}
]
/*
genre: "Classic",
author_details: {
	_id: 100,
	name: "F. Scott ",
	birth_year: 1896
},
_id: 1,
title: "The Great Gatsby",
author_id: 100

...
*/
```
