// 유효 알고리즘 목록(정적 카탈로그).
// 이름/별칭/카테고리만 담는다 — 설명·난이도·코드 등 상세 내용은 AI가 생성한다 (app/api/algorithm).
// 이 목록이 PRD 3.1/5.3이 말하는 "사전 정의된 유효 알고리즘 집합"이다.

export const ALGORITHM_CATEGORIES = [
  '정렬',
  '탐색',
  '그래프',
  '트리',
  '동적계획법',
  '그리디',
  '분할정복',
  '백트래킹',
  '문자열',
  '수학',
  '자료구조',
  '배열',
] as const

export type AlgorithmCategory = (typeof ALGORITHM_CATEGORIES)[number]

export type CatalogEntry = {
  id: string
  name: string
  aliases: string[]
  category: AlgorithmCategory
}

export const ALGORITHM_CATALOG: CatalogEntry[] = [
  // 정렬
  { id: 'bubble-sort', name: '버블 정렬', aliases: ['bubble sort'], category: '정렬' },
  { id: 'selection-sort', name: '선택 정렬', aliases: ['selection sort'], category: '정렬' },
  { id: 'insertion-sort', name: '삽입 정렬', aliases: ['insertion sort'], category: '정렬' },
  { id: 'merge-sort', name: '병합 정렬', aliases: ['merge sort', 'mergesort'], category: '정렬' },
  { id: 'quick-sort', name: '퀵 정렬', aliases: ['quick sort', 'quicksort'], category: '정렬' },
  { id: 'heap-sort', name: '힙 정렬', aliases: ['heap sort'], category: '정렬' },
  { id: 'counting-sort', name: '계수 정렬', aliases: ['counting sort'], category: '정렬' },
  { id: 'radix-sort', name: '기수 정렬', aliases: ['radix sort'], category: '정렬' },
  { id: 'bucket-sort', name: '버킷 정렬', aliases: ['bucket sort'], category: '정렬' },
  { id: 'shell-sort', name: '셸 정렬', aliases: ['shell sort'], category: '정렬' },
  { id: 'tim-sort', name: '팀 정렬', aliases: ['timsort', 'tim sort'], category: '정렬' },

  // 탐색
  { id: 'linear-search', name: '선형 탐색', aliases: ['linear search', '순차 탐색'], category: '탐색' },
  { id: 'binary-search', name: '이진 탐색', aliases: ['binary search', 'bsearch', '이분 탐색'], category: '탐색' },
  { id: 'ternary-search', name: '삼진 탐색', aliases: ['ternary search'], category: '탐색' },
  { id: 'parametric-search', name: '파라메트릭 서치', aliases: ['parametric search', '매개변수 탐색'], category: '탐색' },
  { id: 'interpolation-search', name: '보간 탐색', aliases: ['interpolation search'], category: '탐색' },

  // 그래프
  { id: 'dfs', name: 'DFS (깊이 우선 탐색)', aliases: ['dfs', 'depth first search', '깊이우선탐색'], category: '그래프' },
  { id: 'bfs', name: 'BFS (너비 우선 탐색)', aliases: ['bfs', 'breadth first search', '너비우선탐색'], category: '그래프' },
  { id: 'dijkstra', name: '다익스트라', aliases: ['dijkstra', '다익스트라 최단경로'], category: '그래프' },
  { id: 'bellman-ford', name: '벨만-포드', aliases: ['bellman ford', 'bellman-ford'], category: '그래프' },
  { id: 'floyd-warshall', name: '플로이드-워셜', aliases: ['floyd warshall', 'floyd-warshall'], category: '그래프' },
  { id: 'kruskal', name: '크루스칼 (최소 신장 트리)', aliases: ['kruskal', 'mst'], category: '그래프' },
  { id: 'prim', name: '프림 (최소 신장 트리)', aliases: ['prim'], category: '그래프' },
  { id: 'topological-sort', name: '위상 정렬', aliases: ['topological sort'], category: '그래프' },
  { id: 'scc', name: '강한 연결 요소 (SCC)', aliases: ['scc', 'strongly connected components', '타잔', '코사라주', 'tarjan', 'kosaraju'], category: '그래프' },
  { id: 'bipartite-matching', name: '이분 매칭', aliases: ['bipartite matching'], category: '그래프' },
  { id: 'network-flow', name: '최대 유량', aliases: ['max flow', '네트워크 플로우', 'ford fulkerson', 'edmonds karp'], category: '그래프' },
  { id: 'a-star', name: 'A* 탐색', aliases: ['a star', 'a-star', 'astar'], category: '그래프' },
  { id: 'eulerian-path', name: '오일러 경로/회로', aliases: ['eulerian path', 'euler circuit'], category: '그래프' },
  { id: 'articulation-points', name: '단절점과 단절선', aliases: ['articulation points', 'bridge', 'cut vertex'], category: '그래프' },

  // 트리
  { id: 'tree-traversal', name: '트리 순회', aliases: ['tree traversal', '전위/중위/후위 순회', 'inorder', 'preorder', 'postorder'], category: '트리' },
  { id: 'segment-tree', name: '세그먼트 트리', aliases: ['segment tree'], category: '트리' },
  { id: 'fenwick-tree', name: '펜윅 트리 (BIT)', aliases: ['fenwick tree', 'bit', 'binary indexed tree'], category: '트리' },
  { id: 'lca', name: '최소 공통 조상 (LCA)', aliases: ['lca', 'lowest common ancestor'], category: '트리' },
  { id: 'trie', name: '트라이', aliases: ['trie', '접두사 트리'], category: '트리' },
  { id: 'binary-search-tree', name: '이진 탐색 트리 (BST)', aliases: ['bst', 'binary search tree'], category: '트리' },
  { id: 'avl-tree', name: 'AVL 트리', aliases: ['avl tree', '균형 이진 트리'], category: '트리' },
  { id: 'lazy-propagation', name: '세그먼트 트리 Lazy Propagation', aliases: ['lazy propagation'], category: '트리' },

  // 동적계획법
  { id: 'dynamic-programming', name: '다이나믹 프로그래밍', aliases: ['dp', 'dynamic programming', '동적 계획법'], category: '동적계획법' },
  { id: 'knapsack', name: '배낭 문제 (Knapsack)', aliases: ['knapsack', '배낭문제'], category: '동적계획법' },
  { id: 'lis', name: '최장 증가 부분 수열 (LIS)', aliases: ['lis', 'longest increasing subsequence'], category: '동적계획법' },
  { id: 'lcs', name: '최장 공통 부분 수열 (LCS)', aliases: ['lcs', 'longest common subsequence'], category: '동적계획법' },
  { id: 'edit-distance', name: '편집 거리', aliases: ['edit distance', 'levenshtein distance'], category: '동적계획법' },
  { id: 'coin-change', name: '동전 교환 문제', aliases: ['coin change'], category: '동적계획법' },
  { id: 'matrix-chain-multiplication', name: '행렬 곱 순서 최적화', aliases: ['matrix chain multiplication'], category: '동적계획법' },
  { id: 'bitmask-dp', name: '비트마스크 DP', aliases: ['bitmask dp', '비트마스크 다이나믹 프로그래밍'], category: '동적계획법' },
  { id: 'tree-dp', name: '트리 DP', aliases: ['tree dp'], category: '동적계획법' },
  { id: 'digit-dp', name: '자릿수 DP', aliases: ['digit dp'], category: '동적계획법' },

  // 그리디
  { id: 'greedy', name: '그리디 (탐욕법)', aliases: ['greedy', '탐욕법'], category: '그리디' },
  { id: 'activity-selection', name: '활동 선택 문제', aliases: ['activity selection', '회의실 배정'], category: '그리디' },
  { id: 'huffman-coding', name: '허프만 코딩', aliases: ['huffman coding'], category: '그리디' },
  { id: 'fractional-knapsack', name: '분수 배낭 문제', aliases: ['fractional knapsack'], category: '그리디' },

  // 분할정복
  { id: 'divide-and-conquer', name: '분할 정복', aliases: ['divide and conquer'], category: '분할정복' },
  { id: 'fast-power', name: '분할정복을 이용한 거듭제곱', aliases: ['fast power', 'binary exponentiation'], category: '분할정복' },
  { id: 'closest-pair', name: '가장 가까운 두 점', aliases: ['closest pair of points'], category: '분할정복' },

  // 백트래킹 / 완전탐색
  { id: 'backtracking', name: '백트래킹', aliases: ['backtracking', '퇴각검색'], category: '백트래킹' },
  { id: 'n-queen', name: 'N-Queen', aliases: ['n queen', 'n-queens'], category: '백트래킹' },
  { id: 'permutation-combination', name: '순열과 조합 생성', aliases: ['permutation', 'combination', '순열', '조합'], category: '백트래킹' },
  { id: 'brute-force', name: '완전 탐색', aliases: ['brute force', '무작위 대입'], category: '백트래킹' },

  // 문자열
  { id: 'kmp', name: 'KMP 문자열 매칭', aliases: ['kmp', 'knuth morris pratt', '문자열 매칭'], category: '문자열' },
  { id: 'rabin-karp', name: '라빈-카프', aliases: ['rabin karp'], category: '문자열' },
  { id: 'z-algorithm', name: 'Z 알고리즘', aliases: ['z algorithm'], category: '문자열' },
  { id: 'manacher', name: '매내처 알고리즘', aliases: ['manacher'], category: '문자열' },
  { id: 'suffix-array', name: '접미사 배열', aliases: ['suffix array'], category: '문자열' },
  { id: 'aho-corasick', name: '아호-코라식', aliases: ['aho corasick'], category: '문자열' },

  // 수학 / 정수론
  { id: 'gcd-lcm', name: '최대공약수와 최소공배수', aliases: ['gcd', 'lcm', '유클리드 호제법', 'euclidean algorithm'], category: '수학' },
  { id: 'sieve-of-eratosthenes', name: '에라토스테네스의 체', aliases: ['sieve of eratosthenes', '소수 판별'], category: '수학' },
  { id: 'fast-exponentiation', name: '빠른 거듭제곱', aliases: ['fast exponentiation', 'modular exponentiation'], category: '수학' },
  { id: 'extended-euclidean', name: '확장 유클리드 알고리즘', aliases: ['extended euclidean algorithm'], category: '수학' },
  { id: 'combinatorics', name: '조합론 (이항계수)', aliases: ['combinatorics', '이항계수', 'binomial coefficient'], category: '수학' },
  { id: 'modular-inverse', name: '모듈러 역원', aliases: ['modular inverse'], category: '수학' },
  { id: 'prime-factorization', name: '소인수분해', aliases: ['prime factorization'], category: '수학' },

  // 자료구조
  { id: 'stack', name: '스택', aliases: ['stack'], category: '자료구조' },
  { id: 'queue', name: '큐', aliases: ['queue'], category: '자료구조' },
  { id: 'deque', name: '덱', aliases: ['deque', 'double ended queue'], category: '자료구조' },
  { id: 'priority-queue', name: '우선순위 큐 (힙)', aliases: ['priority queue', 'heap', '힙'], category: '자료구조' },
  { id: 'union-find', name: '유니온 파인드', aliases: ['union find', 'disjoint set', '분리 집합', 'dsu'], category: '자료구조' },
  { id: 'hash-table', name: '해시 테이블', aliases: ['hash table', 'hash map'], category: '자료구조' },
  { id: 'linked-list', name: '연결 리스트', aliases: ['linked list'], category: '자료구조' },

  // 배열
  { id: 'two-pointers', name: '투 포인터', aliases: ['two pointers', '두 포인터'], category: '배열' },
  { id: 'sliding-window', name: '슬라이딩 윈도우', aliases: ['sliding window', '윈도우'], category: '배열' },
  { id: 'prefix-sum', name: '누적합', aliases: ['prefix sum', '구간합'], category: '배열' },
]

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return ALGORITHM_CATALOG.find((a) => a.id === id)
}

/** 부분 문자열 매칭 자동완성. 이름/별칭/카테고리를 대상으로 한다. */
export function searchCatalog(query: string): CatalogEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return ALGORITHM_CATALOG
  return ALGORITHM_CATALOG.filter((a) => {
    const hay = [a.name, a.category, ...a.aliases].join(' ').toLowerCase()
    return hay.includes(q)
  })
}

/** 입력값이 카탈로그의 이름/별칭과 정확히(대소문자 무시) 일치하는 항목을 찾는다. */
export function findExactMatch(query: string): CatalogEntry | undefined {
  const q = query.trim().toLowerCase()
  if (!q) return undefined
  return ALGORITHM_CATALOG.find((a) => {
    const names = [a.name, ...a.aliases].map((n) => n.toLowerCase())
    return names.includes(q)
  })
}

export function isValidAlgorithmId(id: string): boolean {
  return ALGORITHM_CATALOG.some((a) => a.id === id)
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

/**
 * 정확히 일치하지 않는 입력에 대해 가장 유사한 후보를 찾는다 (PRD 5.3, 5.9).
 * 부분 문자열 포함을 우선하고, 그다음 편집 거리로 정렬한다.
 */
export function findClosestEntries(query: string, limit = 5): CatalogEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return ALGORITHM_CATALOG.slice(0, limit)

  const scored = ALGORITHM_CATALOG.map((entry) => {
    const names = [entry.name, ...entry.aliases].map((n) => n.toLowerCase())
    const substringHit = names.some((n) => n.includes(q) || q.includes(n))
    const bestDistance = Math.min(...names.map((n) => levenshtein(q, n)))
    return { entry, substringHit, bestDistance }
  })

  scored.sort((a, b) => {
    if (a.substringHit !== b.substringHit) return a.substringHit ? -1 : 1
    return a.bestDistance - b.bestDistance
  })

  return scored.slice(0, limit).map((s) => s.entry)
}
