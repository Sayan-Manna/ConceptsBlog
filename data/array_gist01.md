---
title: "Array DS Gist 1"
summary: "Curated Array DSA problems gist 1"
image: ""
publishedAt: "2025-05-06"
---

# Arrays

## 1.Sorted and Rotated Check

- think about mod
- logic: `arr[i] > arr[i+1 % n]` count++
- return <= 1 -> for [1,1,1] count is 0

---

## 2.Equilibrium Index

> left sum | ans | right sum (same as left)

#### Total Sum approach

- Find total sum
- total sum - curr elem is equals to leftsum or not
    - if not add that elem in leftSum

---

## 3.Move zeros to end

- Remember the solution
- if 0 skip
- if not swap non zeros, track prev non zero using j and current non zero by i

```java
j =0
for i -> n-1
  if elem_i not 0
    swap elem_i and elem_j
    j++
```

---

## 4.Right rotation

#### reverse method

- reverse(low=0, high=n-d-1)
- reverse(n-d, n-1)
- reverse(0, n-1)

---

## 5.Plus One

- Think about 999 -> all 9 places are 0 and 1 in front extra
- Traverse from right

---

## 6.Find the repeating: LC-287, 142

### Negation

- arr contains n+1 integers, range [1,n] so definitely oone duplicate is there
- index : abs_arr_i
  mark a_index -ve
  if a_index < 0 -> return index
- as [1,n] so safe to use index as arr[i] instead of arr[i]-1

### LL cycle

slow -> 1 step, fast 2 step

- if meet -> position slow to start elem and then move by 1 step -> again meet -> cycle starting point -> repeated no

---

## 7.Contains Duplicate - I lc:219

- arr and k given, return true if a_i == a_j and abs(i-j) <= k

### Hashing 1

- map.put(a_i, idx)
- prevIdx = map.get(a_i) when map already contains a_i
- condition check - return true

### Hashing 2 : map.put return type

- map.put(key, val) does 2 things
    - insert/update
    - if key is previously present -> returns the previous value of key
    - if not present -> returns null

### SW

---

## 8.Intersection of two sorted arrays

## 9.Product of array except self

### Division method

- Think about zero(s) optimization

### Prefix Sum

- Revise

---

## 10.Check if majority exists in a sorted array

### Generic

- array is sorted -> check a_i == a_i-1 do count++ and check if count > n/2 -> both if block
  -> if not equals reset count to 1, so this is else block

### BS

---

## 11.2 Sum closest to target

- Basically sum of two nums that is closest to target
- follow up: [5,2,7,1,4], x=10 => [2,7] as abs diff is > than [4,7]

## Brute

- 2 loops -> take out sum
- Now diff needs to be calculated then update with minDiff also store two elements
- Now diff should be abs diff
    - when determining how close -> the direction (whether greater or lesser to target) doesn't matter.
    - `else if (diff == minDiff) follow up logic`

### 2 pointer O(nlogn + n) | o(1)

- Sort (otherwise how do I know I want sum to be lesser or greater) so that we don't need two loops then perform brute and 2 pointer together
- while left < right because 2 different elements we need to return left <= right be wrong

```md
sort(arr)
left=start and right = end
while (left < right) {
  sum = a_left + a_right
  diff = abs(sum - x)
  if (diff < minDiff) ...
  else if (diff == minDiff) follow up logic
  if (sum < x) -> increase left
  else high--
}
```

## BS

- Sort

---

## 12.2 sum less than K

- Lesser than K but max sum possible

## 2 pointer

- Again sort -> previous question logic
- same technique only condition here is if sum < x -> derive maxSum and left++(becasue we want maximum possible value)
- else high-- => less than K chahiye so default ke liye high--

## BS

---

## 13.K diff pairs

- Basically array is given, k is given -> Pair diff should be k
- We don't want every pair (repeatative) like (1,3), (3,1) so why now (smaller, greater)
- ***

---

## 14.Rearrange array elements by sign

### In-place

---

## 15.Longest Consecutive sequence

### Brute
- see linear search if x is there find x+1, x+2, ... maxCount
- Use while loop

### Better
- Obviously sort the array
- Now duplicates there -> skip -> Use the lastElem to track
- If x+1 is present -> count + 1 -> but we need to check x+1 every time
  - To avoid using while loop we can use a lastElem variable to track
  - if a[i] == lastElem + 1 -> count++ and lastElem = a[i]

### Optimal :: O(N) | O(N) - check analysis
- Need to avoid sorting
  - maybe a set to avoid duplicates and store elements -> then look for x+1, x+2, ...
  - Now set is unordered so order is not fixed
  - As unordered we don't know what will be my starting sequence -> so if x-1 is found then x is not the starting element
  - if `!set.contains(x-1)` do operations -> while to check x+1, x+2, ...


---

## 16.Sort array of 0s, 1s, 2s
### Dutch National Flag
```md
- low, mid, high -> low, mid = 0 initially
        - while mid <= high
            - if arr[mid] == 0
                - swap arr[low] and arr[mid]
                - increment low and mid
            - if arr[mid] == 1
                - increment mid
            - if arr[mid] == 2
                - swap arr[mid] and arr[high]
                - decrement high
```
## 17.3 Sum

### Better
- Hashing
- Iterate i and j -> c = -(a[i] + a[j]) -> if contains in set

### Optimal

```md
- Sort
- 3 pointers -> 1 fix manipulate other twos then sum up
for (i=0; i< n-2)
   skip duplicates -> if (i>0 and current_i == prev_i) continue
   j=i+1, k=n-1
   while j < k :
       - ... if sum < 0 -> we have to increase
       ...
      add to list +  j++, k++
      skip duplicates -> while (j<k and current_j == prev_j) j++
      skip duplicates -> while (j<k and current_k == next_k) k--

```
## 18.3 Sum Closest

### Optimal
```md


```



## 19.Majority Element 2
### Optimal
```md

```

##
