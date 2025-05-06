---
title: "Matrix DS Gist"
summary: "Curated Matrix DSA problems gist 1"
image: ""
publishedAt: "2025-05-06"
---

## #Wave Traversal

```dat  ^---
11|  12 |13  14
21| 22  |23  24
31|  32 | 33  34
  > ----
o/p: 11 21 31 32 22 12 ...

```
- carefully observe 1 st col -> down, 2nd col -> up, 3rd col -> down ,...
- Odd col -> down, even col -> up
```dat
Traverse col wise (j) - fix col
    if j % 2 == 0
        - need to print col 1, but I need access of i so run a loop
        - for i -> 0 to n-1
            print arr[i][j] -- j is fixed
    else ...
```
---
## #Sum of Diagonals

```md
Traverse both m, n
principle diagonal : `i==j print arr[i][j]`
secondary diagonal: `i+j == n-1 print arr[i][j]`
---
In one pass
Traverse row wise
principle diagonal: `pd += arr[i][i]` hey i is changing so every time i,i represents i,j
secondary diagonal: sd will be in terms of i and i is fixed, col is changing so `col = n-1-i`
`sd += arr[i][col]`
```
---
## #Boundary of matrix
- i==0, j==0, j=n-1, i=n-1

---

## #Row with max number of 1s

### BS

---
## #Sort all elements of matrix

### flatten the matrix into a list/array -> sort -> re-fill the matrix

```md
int temp[n*n]
idx = 0 this is to traverse our temp array
for every row [] in matrix
    for every num in row[]
        temp[idx++] = num

sort(temp)
idx = 0 -> again to traverse temp
for every row[] in matrix
   Traverse the row using normal for
        row[i] = temp[idx++]

```
### Min Heap

---

## #Rotate by 90deg
### Brute-force
```dat
- IF you look closely 1st row becomes the last column, 2nd row becomes the 2nd last column ...
- So for every row col will be n-i-1 => for 0th row col will be 3-1=2 index col (i.e. last col)
- Also original and rotated row if you check
    [0,0] = [0,2]
    [0,1] = [1,2]
    [0,2] = [2,2]
    [0,3] = [3,2]
    [i,j] = [i,j]
          = [j, n-1-i] (This way I can write this)
- So for every row i, col will be n-1-i and j is equals to i
-----
for every row i
    for every col j
        arr[j][n-1-i] = arr[i][j]

```
### Optimal

```text
- Transpose the matrix : 1st row becomes 1st col + Reverse


```

## #Set Matrix Zeroes
