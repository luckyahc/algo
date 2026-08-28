// 유효 알고리즘 목록(정적 카탈로그).
// 이름/별칭/카테고리만 담는다 — 설명·난이도·코드 등 상세 내용은 AI가 생성한다 (app/api/algorithm).
// 이 목록이 PRD 3.1/5.3이 말하는 "사전 정의된 유효 알고리즘 집합"이다.
//
// 2026-08-28: 기초(학부 알고리즘 수업/일반 코딩테스트) 범위였던 82개에, QOJ(Universal
// Online Judge) 수준(ICPC World Finals/IOI/CCPC/Petrozavodsk 캠프 등) 문제 에디토리얼에서
// 실제로 도구로 쓰이는 고급 알고리즘/기법 143개를 추가했다(1차 확장). 카테고리도 기하/다항식/
// 게임이론 3개를 새로 만들었다.
// 이어서 사용자가 제시한 종합 커리큘럼(USACO Guide류 전 범위) 목록을 병합해 48개를 더
// 추가했다(2차 확장, '기초' 카테고리 신설). 두 확장 모두 "판단이 애매한"/범위 밖 항목(알파-베타
// 가지치기, 좌표 압축 등은 재검토 후 포함됨; SQL·동시성 프로그래밍·인터랙티브·Design 같은
// 문제 유형 태그나 미적분학·물리학 같은 순수 학문 분야는 "알고리즘"이 아니라서 계속 제외)은
// 골라냈다.

export const ALGORITHM_CATEGORIES = [
  '기초',
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
  '기하',
  '다항식',
  '게임이론',
] as const

export type AlgorithmCategory = (typeof ALGORITHM_CATEGORIES)[number]

export type CatalogEntry = {
  id: string
  name: string
  aliases: string[]
  category: AlgorithmCategory
}

export const ALGORITHM_CATALOG: CatalogEntry[] = [
  // 기초
  { id: 'implementation', name: '구현', aliases: ['implementation'], category: '기초' },
  { id: 'simulation', name: '시뮬레이션', aliases: ['simulation'], category: '기초' },
  { id: 'ad-hoc', name: '애드 혹', aliases: ['ad hoc'], category: '기초' },
  { id: 'recursion', name: '재귀', aliases: ['recursion'], category: '기초' },
  { id: 'heuristics', name: '휴리스틱', aliases: ['heuristics'], category: '기초' },
  { id: 'simulated-annealing', name: '담금질 기법', aliases: ['simulated annealing'], category: '기초' },
  { id: 'gradient-descent', name: '경사 하강법', aliases: ['gradient descent'], category: '기초' },
  { id: 'randomization', name: '무작위화', aliases: ['randomization', 'randomized algorithm'], category: '기초' },
  { id: 'rejection-sampling', name: '거부 샘플링', aliases: ['rejection sampling'], category: '기초' },
  { id: 'reservoir-sampling', name: '저수지 샘플링', aliases: ['reservoir sampling'], category: '기초' },

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
  { id: 'ternary-search', name: '삼진 탐색', aliases: ['ternary search', '삼분 탐색'], category: '탐색' },
  { id: 'parametric-search', name: '파라메트릭 서치', aliases: ['parametric search', '매개변수 탐색'], category: '탐색' },
  { id: 'interpolation-search', name: '보간 탐색', aliases: ['interpolation search'], category: '탐색' },
  { id: 'quickselect', name: '퀵 셀렉트', aliases: ['quickselect', 'median of medians', '선형 시간 선택'], category: '탐색' },
  { id: 'meet-in-the-middle', name: '반씩 나눠 풀기', aliases: ['meet in the middle'], category: '탐색' },

  // 그래프
  { id: 'dfs', name: 'DFS (깊이 우선 탐색)', aliases: ['dfs', 'depth first search', '깊이우선탐색'], category: '그래프' },
  { id: 'bfs', name: 'BFS (너비 우선 탐색)', aliases: ['bfs', 'breadth first search', '너비우선탐색'], category: '그래프' },
  { id: 'dijkstra', name: '다익스트라', aliases: ['dijkstra', '다익스트라 최단경로'], category: '그래프' },
  { id: 'bellman-ford', name: '벨만-포드', aliases: ['bellman ford', 'bellman-ford', 'spfa'], category: '그래프' },
  { id: 'floyd-warshall', name: '플로이드-워셜', aliases: ['floyd warshall', 'floyd-warshall'], category: '그래프' },
  { id: 'johnson-algorithm', name: '존슨 알고리즘', aliases: ["johnson's algorithm", 'johnson algorithm'], category: '그래프' },
  { id: 'kruskal', name: '크루스칼 (최소 신장 트리)', aliases: ['kruskal', 'mst'], category: '그래프' },
  { id: 'prim', name: '프림 (최소 신장 트리)', aliases: ['prim'], category: '그래프' },
  { id: 'boruvka', name: '보루프카 알고리즘', aliases: ["boruvka's algorithm", 'boruvka'], category: '그래프' },
  { id: 'second-best-mst', name: 'MST 두 번째로 작은 트리', aliases: ['second best mst'], category: '그래프' },
  { id: 'topological-sort', name: '위상 정렬', aliases: ['topological sort'], category: '그래프' },
  { id: 'scc', name: '강한 연결 요소 (SCC)', aliases: ['scc', 'strongly connected components', '타잔', '코사라주', 'tarjan', 'kosaraju'], category: '그래프' },
  { id: 'bipartite-matching', name: '이분 매칭', aliases: ['bipartite matching', 'hopcroft karp'], category: '그래프' },
  { id: 'blossom-algorithm', name: '블라섬 알고리즘 (일반 그래프 매칭)', aliases: ['blossom algorithm', "edmonds' matching"], category: '그래프' },
  { id: 'hungarian-algorithm', name: '헝가리안 알고리즘', aliases: ['hungarian algorithm', 'kuhn-munkres', '가중치 이분 매칭'], category: '그래프' },
  { id: 'network-flow', name: '최대 유량', aliases: ['max flow', '네트워크 플로우', 'ford fulkerson', 'edmonds karp', 'dinic', 'push relabel'], category: '그래프' },
  { id: 'min-cut', name: '최소 컷', aliases: ['min cut', 'max-flow min-cut theorem'], category: '그래프' },
  { id: 'mcmf', name: '최소 비용 최대 유량', aliases: ['mcmf', 'min cost max flow'], category: '그래프' },
  { id: 'stoer-wagner', name: '글로벌 민컷 (Stoer-Wagner)', aliases: ['stoer wagner', 'global min cut'], category: '그래프' },
  { id: 'flow-lower-bounds', name: '하한이 있는 유량', aliases: ['flow with lower bounds'], category: '그래프' },
  { id: 'bipartiteness-check', name: '이분 그래프 판별', aliases: ['bipartiteness check'], category: '그래프' },
  { id: 'gale-shapley', name: '안정 매칭 (Gale-Shapley)', aliases: ['gale shapley', 'stable marriage'], category: '그래프' },
  { id: '2-sat', name: '2-SAT', aliases: ['2 sat', 'two sat'], category: '그래프' },
  { id: 'a-star', name: 'A* 탐색', aliases: ['a star', 'a-star', 'astar'], category: '그래프' },
  { id: 'eulerian-path', name: '오일러 경로/회로', aliases: ['eulerian path', 'euler circuit', 'hierholzer'], category: '그래프' },
  { id: 'articulation-points', name: '단절점과 단절선', aliases: ['articulation points', 'bridge', 'cut vertex'], category: '그래프' },
  { id: 'biconnected-components', name: '이중 연결 요소', aliases: ['biconnected components'], category: '그래프' },
  { id: 'dominator-tree', name: '지배자 트리', aliases: ['dominator tree', 'lengauer-tarjan'], category: '그래프' },
  { id: 'chu-liu-edmonds', name: '최소 arborescence (Chu-Liu/Edmonds)', aliases: ['chu liu edmonds', 'directed mst', 'minimum arborescence'], category: '그래프' },
  { id: 'gomory-hu-tree', name: 'Gomory-Hu 트리', aliases: ['gomory hu tree'], category: '그래프' },
  { id: 'matroid-intersection', name: '매트로이드 교차', aliases: ['matroid intersection'], category: '그래프' },
  { id: 'karp-min-mean-cycle', name: '최소 평균 사이클 (Karp)', aliases: ['minimum mean cycle', "karp's algorithm"], category: '그래프' },
  { id: 'suurballe-algorithm', name: 'Suurballe 알고리즘', aliases: ['suurballe algorithm', 'edge disjoint shortest paths'], category: '그래프' },
  { id: 'manhattan-mst', name: '맨해튼 거리 최소 스패닝 트리', aliases: ['manhattan mst'], category: '그래프' },
  { id: 'matrix-tree-theorem', name: '행렬 트리 정리 (Kirchhoff)', aliases: ['matrix tree theorem', "kirchhoff's theorem", '스패닝 트리 개수'], category: '그래프' },
  { id: 'yens-algorithm', name: 'k번째 최단 경로 (Yen\'s Algorithm)', aliases: ["yen's algorithm", 'k shortest paths'], category: '그래프' },
  { id: 'difference-constraints', name: '차분 제약 시스템', aliases: ['difference constraints', 'system of difference constraints'], category: '그래프' },
  { id: 'zero-one-bfs', name: '0-1 너비 우선 탐색', aliases: ['0-1 bfs', 'zero one bfs'], category: '그래프' },
  { id: 'bidirectional-search', name: '양방향 탐색', aliases: ['bidirectional search'], category: '그래프' },
  { id: 'flood-fill', name: '플러드 필', aliases: ['flood fill'], category: '그래프' },
  { id: 'functional-graph', name: '함수형 그래프', aliases: ['functional graph'], category: '그래프' },
  { id: 'planar-graph', name: '평면 그래프', aliases: ['planar graph'], category: '그래프' },
  { id: 'tsp', name: '외판원 순회 문제', aliases: ['traveling salesman problem', 'tsp', 'held-karp'], category: '그래프' },
  { id: 'dual-graph', name: '쌍대 그래프', aliases: ['dual graph'], category: '그래프' },
  { id: 'bounded-treewidth', name: '제한된 트리 너비', aliases: ['bounded treewidth', 'treewidth dp'], category: '그래프' },

  // 트리
  { id: 'tree-traversal', name: '트리 순회', aliases: ['tree traversal', '전위/중위/후위 순회', 'inorder', 'preorder', 'postorder'], category: '트리' },
  { id: 'segment-tree', name: '세그먼트 트리', aliases: ['segment tree'], category: '트리' },
  { id: 'fenwick-tree', name: '펜윅 트리 (BIT)', aliases: ['fenwick tree', 'bit', 'binary indexed tree'], category: '트리' },
  { id: 'lca', name: '최소 공통 조상 (LCA)', aliases: ['lca', 'lowest common ancestor'], category: '트리' },
  { id: 'trie', name: '트라이', aliases: ['trie', '접두사 트리'], category: '트리' },
  { id: 'binary-search-tree', name: '이진 탐색 트리 (BST)', aliases: ['bst', 'binary search tree'], category: '트리' },
  { id: 'avl-tree', name: 'AVL 트리', aliases: ['avl tree', '균형 이진 트리'], category: '트리' },
  { id: 'lazy-propagation', name: '세그먼트 트리 Lazy Propagation', aliases: ['lazy propagation'], category: '트리' },
  { id: 'tree-diameter', name: '트리 지름', aliases: ['tree diameter'], category: '트리' },
  { id: 'centroid-decomposition', name: '센트로이드 분할', aliases: ['centroid decomposition'], category: '트리' },
  { id: 'euler-tour-technique', name: '오일러 투어 테크닉', aliases: ['euler tour technique'], category: '트리' },
  { id: 'heavy-light-decomposition', name: '헤비-라이트 분할', aliases: ['heavy light decomposition', 'hld'], category: '트리' },
  { id: 'link-cut-tree', name: '링크-컷 트리', aliases: ['link cut tree', 'lct'], category: '트리' },
  { id: 'dsu-on-tree', name: 'Small-to-Large 병합 (DSU on Tree)', aliases: ['dsu on tree', 'small to large merging'], category: '트리' },
  { id: 'virtual-tree', name: '가상 트리', aliases: ['virtual tree', 'auxiliary tree', '트리 압축'], category: '트리' },
  { id: 'tree-hashing', name: '트리 해싱/동형 판정', aliases: ['tree hashing', 'tree isomorphism', 'ahu algorithm'], category: '트리' },
  { id: 'tree-centroid', name: '센트로이드 (트리 무게중심)', aliases: ['tree centroid'], category: '트리' },

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
  { id: 'probability-dp', name: '확률/기댓값 DP', aliases: ['probability dp', 'expected value dp'], category: '동적계획법' },
  { id: 'sos-dp', name: 'Sum over Subsets DP (SOS DP)', aliases: ['sos dp', 'sum over subsets'], category: '동적계획법' },
  { id: 'tree-rerooting-dp', name: '트리 재루팅 DP', aliases: ['rerooting technique', 'reroot dp'], category: '동적계획법' },
  { id: 'tree-knapsack-dp', name: '트리 냅색 DP', aliases: ['tree knapsack dp'], category: '동적계획법' },
  { id: 'convex-hull-trick', name: 'Convex Hull Trick (CHT)', aliases: ['convex hull trick', 'cht'], category: '동적계획법' },
  { id: 'li-chao-tree', name: 'Li Chao Tree', aliases: ['li chao tree'], category: '동적계획법' },
  { id: 'kinetic-segment-tree', name: 'Kinetic Segment Tree', aliases: ['kinetic segment tree'], category: '동적계획법' },
  { id: 'dc-optimization', name: '분할정복 최적화', aliases: ['divide and conquer optimization', 'd&c optimization'], category: '동적계획법' },
  { id: 'knuths-optimization', name: "Knuth의 최적화", aliases: ["knuth's optimization"], category: '동적계획법' },
  { id: 'monotonic-queue-optimization', name: '단조 큐 최적화', aliases: ['monotonic queue optimization'], category: '동적계획법' },
  { id: 'smawk', name: 'SMAWK 알고리즘', aliases: ['smawk algorithm'], category: '동적계획법' },
  { id: 'aliens-trick', name: 'Aliens 트릭', aliases: ['aliens trick', 'lagrangian relaxation', "alien's trick"], category: '동적계획법' },
  { id: 'slope-trick', name: '기울기 트릭 (Slope Trick)', aliases: ['slope trick'], category: '동적계획법' },
  { id: 'broken-profile-dp', name: '윤곽선 DP', aliases: ['broken profile dp', 'profile dp'], category: '동적계획법' },
  { id: 'bitset-dp', name: 'Bitset 최적화 DP', aliases: ['bitset dp', 'bitset optimization'], category: '동적계획법' },
  { id: 'min-plus-convolution', name: '(min,+) 컨볼루션', aliases: ['min plus convolution', 'tropical convolution'], category: '동적계획법' },
  { id: 'plug-dp', name: '커넥션 프로파일 DP', aliases: ['plug dp', 'connection profile dp', 'broken profile connectivity dp'], category: '동적계획법' },
  { id: 'kadanes-algorithm', name: '최대 부분 배열 문제', aliases: ["kadane's algorithm", 'maximum subarray'], category: '동적계획법' },
  { id: 'hirschberg-algorithm', name: '히르쉬버그', aliases: ["hirschberg's algorithm", 'linear space lcs'], category: '동적계획법' },
  { id: 'bulldozer-trick', name: 'Bulldozer 트릭', aliases: ['bulldozer trick'], category: '동적계획법' },

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
  { id: 'dancing-links', name: '크누스 X (Dancing Links)', aliases: ['dancing links', 'algorithm x', 'knuths algorithm x'], category: '백트래킹' },

  // 문자열
  { id: 'kmp', name: 'KMP 문자열 매칭', aliases: ['kmp', 'knuth morris pratt', '문자열 매칭'], category: '문자열' },
  { id: 'rabin-karp', name: '라빈-카프', aliases: ['rabin karp', 'rolling hash', '롤링 해시'], category: '문자열' },
  { id: 'z-algorithm', name: 'Z 알고리즘', aliases: ['z algorithm'], category: '문자열' },
  { id: 'manacher', name: '매내처 알고리즘', aliases: ['manacher'], category: '문자열' },
  { id: 'suffix-array', name: '접미사 배열', aliases: ['suffix array'], category: '문자열' },
  { id: 'kasai-lcp-array', name: 'Kasai\'s LCP 배열', aliases: ['kasai algorithm', 'lcp array'], category: '문자열' },
  { id: 'suffix-tree', name: '접미사 트리', aliases: ['suffix tree', "ukkonen's algorithm"], category: '문자열' },
  { id: 'suffix-automaton', name: '접미사 자동자', aliases: ['suffix automaton'], category: '문자열' },
  { id: 'generalized-suffix-automaton', name: '일반화 접미사 자동자', aliases: ['generalized suffix automaton'], category: '문자열' },
  { id: 'aho-corasick', name: '아호-코라식', aliases: ['aho corasick'], category: '문자열' },
  { id: 'palindromic-tree', name: '팰린드롬 자동자 (Eertree)', aliases: ['palindromic tree', 'eertree'], category: '문자열' },
  { id: 'lyndon-words', name: 'Lyndon 단어 / Booth\'s 알고리즘', aliases: ['lyndon words', "booth's algorithm", '최소 회전 문자열'], category: '문자열' },
  { id: 'lz-factorization', name: 'Lempel-Ziv 분해', aliases: ['lz factorization', 'lempel ziv'], category: '문자열' },
  { id: 'main-lorentz', name: 'Main-Lorentz 알고리즘', aliases: ['main lorentz algorithm'], category: '문자열' },
  { id: 'regex-matching', name: '정규 표현식', aliases: ['regular expression', 'regex'], category: '문자열' },

  // 수학 / 정수론
  { id: 'gcd-lcm', name: '최대공약수와 최소공배수', aliases: ['gcd', 'lcm', '유클리드 호제법', 'euclidean algorithm'], category: '수학' },
  { id: 'sieve-of-eratosthenes', name: '에라토스테네스의 체', aliases: ['sieve of eratosthenes', '소수 판별'], category: '수학' },
  { id: 'fast-exponentiation', name: '빠른 거듭제곱', aliases: ['fast exponentiation', 'modular exponentiation'], category: '수학' },
  { id: 'extended-euclidean', name: '확장 유클리드 알고리즘', aliases: ['extended euclidean algorithm'], category: '수학' },
  { id: 'combinatorics', name: '조합론 (이항계수)', aliases: ['combinatorics', '이항계수', 'binomial coefficient'], category: '수학' },
  { id: 'modular-inverse', name: '모듈러 역원', aliases: ['modular inverse'], category: '수학' },
  { id: 'prime-factorization', name: '소인수분해', aliases: ['prime factorization'], category: '수학' },
  { id: 'crt', name: '중국인의 나머지 정리', aliases: ['chinese remainder theorem', 'crt'], category: '수학' },
  { id: 'euler-totient', name: '오일러 피 함수', aliases: ["euler's totient function", 'euler phi'], category: '수학' },
  { id: 'fermat-little-theorem', name: '페르마의 소정리', aliases: ["fermat's little theorem"], category: '수학' },
  { id: 'miller-rabin', name: '밀러-라빈 소수판별법', aliases: ['miller rabin primality test'], category: '수학' },
  { id: 'pollard-rho', name: '폴라드 로', aliases: ["pollard's rho"], category: '수학' },
  { id: 'mobius-function', name: '뫼비우스 함수와 반전', aliases: ['mobius function', 'mobius inversion'], category: '수학' },
  { id: 'discrete-log-bsgs', name: '이산 로그 (Baby-step Giant-step)', aliases: ['discrete log', 'baby step giant step', 'bsgs'], category: '수학' },
  { id: 'discrete-sqrt', name: '이산 제곱근', aliases: ['tonelli shanks', "cipolla's algorithm", 'discrete square root'], category: '수학' },
  { id: 'primitive-root', name: '원시근', aliases: ['primitive root'], category: '수학' },
  { id: 'catalan-numbers', name: '카탈랑 수', aliases: ['catalan numbers'], category: '수학' },
  { id: 'stirling-numbers', name: '스털링 수', aliases: ['stirling numbers'], category: '수학' },
  { id: 'bell-numbers', name: '벨 수', aliases: ['bell numbers'], category: '수학' },
  { id: 'partition-function', name: '정수 분할', aliases: ['partition function', 'pentagonal number theorem'], category: '수학' },
  { id: 'inclusion-exclusion', name: '포함-배제의 원리', aliases: ['inclusion exclusion principle'], category: '수학' },
  { id: 'burnside-polya', name: '번사이드 보조정리 / 폴리아 계수법', aliases: ["burnside's lemma", 'polya enumeration theorem'], category: '수학' },
  { id: 'lagrange-interpolation', name: '라그랑주 보간법', aliases: ['lagrange interpolation'], category: '수학' },
  { id: 'gaussian-elimination', name: '가우스 소거법', aliases: ['gaussian elimination'], category: '수학' },
  { id: 'determinant', name: '행렬식 계산', aliases: ['determinant calculation'], category: '수학' },
  { id: 'xor-basis', name: '선형 기저 / XOR 기저', aliases: ['linear basis', 'xor basis'], category: '수학' },
  { id: 'matrix-exponentiation', name: '행렬 거듭제곱', aliases: ['matrix exponentiation', 'matrix power'], category: '수학' },
  { id: 'berlekamp-massey', name: 'Berlekamp-Massey 알고리즘', aliases: ['berlekamp massey algorithm'], category: '수학' },
  { id: 'kitamasa-method', name: '킷타마사 법', aliases: ['kitamasa method'], category: '수학' },
  { id: 'cayley-formula', name: '케일리 공식', aliases: ["cayley's formula"], category: '수학' },
  { id: 'lgv-lemma', name: 'LGV 보조정리', aliases: ['lindstrom gessel viennot lemma', 'lgv lemma'], category: '수학' },
  { id: 'dirichlet-convolution', name: '디리클레 합성곱 / 배수 시브', aliases: ['dirichlet convolution', 'divisor sieve technique'], category: '수학' },
  { id: 'du-sieve', name: "두교 시브 (Du's Sieve)", aliases: ["du's sieve", 'du jiao sieve'], category: '수학' },
  { id: 'min-25-sieve', name: 'Min_25 시브', aliases: ['min 25 sieve', 'min25 sieve'], category: '수학' },
  { id: 'powerful-number-sieve', name: '강력수 시브', aliases: ['powerful number sieve'], category: '수학' },
  { id: 'floor-sum', name: '유사 유클리드 알고리즘', aliases: ['floor sum algorithm', 'euclidean-like algorithm'], category: '수학' },
  { id: 'generating-functions', name: '생성 함수', aliases: ['generating functions'], category: '수학' },
  { id: 'linearity-of-expectation', name: '기댓값의 선형성', aliases: ['linearity of expectation'], category: '수학' },
  { id: 'lucas-theorem', name: '뤼카 정리', aliases: ["lucas' theorem"], category: '수학' },
  { id: 'pisano-period', name: '피사노 주기', aliases: ['pisano period'], category: '수학' },
  { id: 'halls-marriage-theorem', name: '홀의 결혼 정리', aliases: ["hall's marriage theorem", 'hall theorem'], category: '수학' },
  { id: 'lte-lemma', name: '지수 승강 보조정리', aliases: ['lifting the exponent', 'lte lemma'], category: '수학' },
  { id: 'linear-programming', name: '선형 계획법', aliases: ['linear programming', 'lp'], category: '수학' },
  { id: 'pigeonhole-principle', name: '비둘기집 원리', aliases: ['pigeonhole principle'], category: '수학' },
  { id: 'parity-argument', name: '홀짝성', aliases: ['parity argument'], category: '수학' },
  { id: 'invariant-finding', name: '불변량 찾기', aliases: ['invariant', 'invariant finding'], category: '수학' },
  { id: 'permutation-cycle-decomposition', name: '순열 사이클 분할', aliases: ['permutation cycle decomposition'], category: '수학' },

  // 자료구조
  { id: 'stack', name: '스택', aliases: ['stack'], category: '자료구조' },
  { id: 'queue', name: '큐', aliases: ['queue'], category: '자료구조' },
  { id: 'deque', name: '덱', aliases: ['deque', 'double ended queue'], category: '자료구조' },
  { id: 'priority-queue', name: '우선순위 큐 (힙)', aliases: ['priority queue', 'heap', '힙'], category: '자료구조' },
  { id: 'union-find', name: '유니온 파인드', aliases: ['union find', 'disjoint set', '분리 집합', 'dsu'], category: '자료구조' },
  { id: 'dsu-rollback', name: '롤백 지원 유니온 파인드', aliases: ['dsu with rollback', 'union find rollback'], category: '자료구조' },
  { id: 'weighted-union-find', name: '가중치 유니온 파인드', aliases: ['weighted union find'], category: '자료구조' },
  { id: 'hash-table', name: '해시 테이블', aliases: ['hash table', 'hash map'], category: '자료구조' },
  { id: 'linked-list', name: '연결 리스트', aliases: ['linked list'], category: '자료구조' },
  { id: 'doubly-linked-list', name: '이중 연결 리스트', aliases: ['doubly linked list'], category: '자료구조' },
  { id: 'red-black-tree', name: '레드-블랙 트리', aliases: ['red black tree'], category: '자료구조' },
  { id: 'top-tree', name: '탑 트리', aliases: ['top tree'], category: '자료구조' },
  { id: 'cartesian-tree', name: '데카르트 트리', aliases: ['cartesian tree'], category: '자료구조' },
  { id: 'deque-sliding-window-max', name: '덱을 이용한 구간 최댓값 트릭', aliases: ['sliding window maximum', 'monotonic deque'], category: '자료구조' },
  { id: 'segment-tree-merge', name: '세그먼트 트리 병합', aliases: ['segment tree merge'], category: '자료구조' },
  { id: 'persistent-segment-tree', name: '영속 세그먼트 트리', aliases: ['persistent segment tree'], category: '자료구조' },
  { id: 'persistent-data-structure', name: '영속 자료구조', aliases: ['persistent data structures'], category: '자료구조' },
  { id: 'persistent-union-find', name: '영속 유니온 파인드', aliases: ['persistent union find'], category: '자료구조' },
  { id: 'persistent-trie', name: '영속 트라이', aliases: ['persistent trie'], category: '자료구조' },
  { id: 'segment-tree-beats', name: '세그먼트 트리 비츠', aliases: ['segment tree beats'], category: '자료구조' },
  { id: 'sqrt-decomposition', name: 'Sqrt 분할법', aliases: ['sqrt decomposition', '제곱근 분할법'], category: '자료구조' },
  { id: 'mo-algorithm', name: "Mo's 알고리즘", aliases: ["mo's algorithm"], category: '자료구조' },
  { id: 'mo-on-trees', name: '트리 위의 Mo\'s 알고리즘', aliases: ["mo's algorithm on trees"], category: '자료구조' },
  { id: 'mo-with-updates', name: '갱신이 있는 Mo\'s 알고리즘', aliases: ["mo's algorithm with updates"], category: '자료구조' },
  { id: 'treap', name: '트립 (Treap)', aliases: ['treap'], category: '자료구조' },
  { id: 'splay-tree', name: '스플레이 트리', aliases: ['splay tree'], category: '자료구조' },
  { id: 'pairing-heap', name: '페어링 힙', aliases: ['pairing heap'], category: '자료구조' },
  { id: 'leftist-heap', name: '레프티스트 힙', aliases: ['leftist heap'], category: '자료구조' },
  { id: 'binomial-heap', name: '이항 힙', aliases: ['binomial heap'], category: '자료구조' },
  { id: 'sparse-table', name: '희소 배열 (Sparse Table)', aliases: ['sparse table'], category: '자료구조' },
  { id: 'disjoint-sparse-table', name: 'Disjoint Sparse Table', aliases: ['disjoint sparse table'], category: '자료구조' },
  { id: 'sqrt-tree', name: 'Sqrt Tree', aliases: ['sqrt tree'], category: '자료구조' },
  { id: 'fractional-cascading', name: 'Fractional Cascading', aliases: ['fractional cascading'], category: '자료구조' },
  { id: 'cdq-divide-conquer', name: 'CDQ 분할정복', aliases: ['cdq divide and conquer'], category: '자료구조' },
  { id: 'parallel-binary-search', name: '이분 탐색 병렬화', aliases: ['parallel binary search'], category: '자료구조' },
  { id: 'merge-sort-tree', name: '병합 정렬 트리', aliases: ['merge sort tree'], category: '자료구조' },
  { id: 'kd-tree', name: 'KD 트리', aliases: ['kd tree'], category: '자료구조' },
  { id: 'chtholly-tree', name: 'Chtholly Tree', aliases: ['chtholly tree', 'old driver tree'], category: '자료구조' },
  { id: 'offline-dynamic-connectivity', name: '오프라인 동적 연결성', aliases: ['offline dynamic connectivity'], category: '자료구조' },
  { id: 'time-reversal-technique', name: '시간 역행 기법', aliases: ['offline reverse deletion technique'], category: '자료구조' },

  // 배열
  { id: 'two-pointers', name: '투 포인터', aliases: ['two pointers', '두 포인터'], category: '배열' },
  { id: 'sliding-window', name: '슬라이딩 윈도우', aliases: ['sliding window', '윈도우'], category: '배열' },
  { id: 'prefix-sum', name: '누적합', aliases: ['prefix sum', '구간합'], category: '배열' },
  { id: 'coordinate-compression', name: '값/좌표 압축', aliases: ['coordinate compression', 'value compression'], category: '배열' },
  { id: 'difference-array', name: '차분 배열 트릭', aliases: ['difference array'], category: '배열' },

  // 기하
  { id: 'convex-hull', name: '볼록 껍질', aliases: ['convex hull', 'graham scan', "andrew's monotone chain", 'jarvis march'], category: '기하' },
  { id: 'segment-intersection', name: '선분 교차 판정', aliases: ['line segment intersection'], category: '기하' },
  { id: 'bentley-ottmann', name: 'Bentley-Ottmann 알고리즘', aliases: ['bentley ottmann algorithm', '선분 교차 스위핑'], category: '기하' },
  { id: 'rotating-calipers', name: '로테이팅 캘리퍼스', aliases: ['rotating calipers'], category: '기하' },
  { id: 'half-plane-intersection', name: '반평면 교집합', aliases: ['half plane intersection'], category: '기하' },
  { id: 'delaunay-triangulation', name: '들로네 삼각분할', aliases: ['delaunay triangulation'], category: '기하' },
  { id: 'voronoi-diagram', name: '보로노이 다이어그램', aliases: ['voronoi diagram'], category: '기하' },
  { id: 'polygon-area-shoelace', name: '다각형 넓이 (Shoelace Formula)', aliases: ['shoelace formula', 'polygon area'], category: '기하' },
  { id: 'point-in-polygon', name: '점의 다각형 내부 판정', aliases: ['point in polygon'], category: '기하' },
  { id: 'polygon-clipping', name: '다각형 절단', aliases: ['polygon clipping', 'sutherland hodgman'], category: '기하' },
  { id: 'minimum-enclosing-circle', name: '최소 외접원', aliases: ["welzl's algorithm", 'minimum enclosing circle'], category: '기하' },
  { id: 'convex-hull-3d', name: '3차원 볼록 껍질', aliases: ['3d convex hull'], category: '기하' },
  { id: 'sweep-line-technique', name: '스위핑 라인 기법', aliases: ['sweep line technique'], category: '기하' },
  { id: 'angular-sort', name: '각도 정렬', aliases: ['angular sort', 'polar angle sort'], category: '기하' },
  { id: 'greens-theorem', name: '그린 정리', aliases: ["green's theorem"], category: '기하' },
  { id: 'boolean-ops-on-shapes', name: '도형에서의 불 연산', aliases: ['boolean operations on shapes', 'polygon union intersection'], category: '기하' },
  { id: 'picks-theorem', name: '픽의 정리', aliases: ["pick's theorem"], category: '기하' },

  // 다항식 / FFT·NTT
  { id: 'fft', name: '고속 푸리에 변환 (FFT)', aliases: ['fft', 'fast fourier transform'], category: '다항식' },
  { id: 'ntt', name: '수론적 변환 (NTT)', aliases: ['ntt', 'number theoretic transform'], category: '다항식' },
  { id: 'karatsuba-multiplication', name: '카라추바 곱셈', aliases: ['karatsuba multiplication'], category: '다항식' },
  { id: 'polynomial-mod', name: '다항식 곱셈/나눗셈 (mod x^n)', aliases: ['polynomial multiplication', 'polynomial division mod xn'], category: '다항식' },
  { id: 'polynomial-inverse', name: '다항식 역원', aliases: ['polynomial inverse'], category: '다항식' },
  { id: 'polynomial-log-exp', name: '다항식 로그/지수', aliases: ['polynomial log', 'polynomial exp'], category: '다항식' },
  { id: 'polynomial-sqrt', name: '다항식 제곱근', aliases: ['polynomial square root'], category: '다항식' },
  { id: 'divide-conquer-fft', name: '분할정복 FFT', aliases: ['divide and conquer fft'], category: '다항식' },
  { id: 'multipoint-eval-interpolation', name: '다중점 계산/보간', aliases: ['multipoint evaluation', 'polynomial interpolation'], category: '다항식' },
  { id: 'bluestein-algorithm', name: 'Bluestein 알고리즘', aliases: ['bluestein algorithm', 'chirp z transform'], category: '다항식' },
  { id: 'fwt', name: '고속 왈시-아다마르 변환 (FWT)', aliases: ['fwt', 'fast walsh hadamard transform'], category: '다항식' },
  { id: 'subset-convolution', name: 'Subset Convolution', aliases: ['subset convolution'], category: '다항식' },

  // 게임 이론
  { id: 'sprague-grundy', name: '스프라그-그런디 정리', aliases: ['sprague grundy theorem', '님버', 'nimbers'], category: '게임이론' },
  { id: 'nim-game', name: '님 게임', aliases: ['nim game'], category: '게임이론' },
  { id: 'wythoff-game', name: '위조프 게임', aliases: ["wythoff's game"], category: '게임이론' },
  { id: 'minimax', name: '미니맥스', aliases: ['minimax'], category: '게임이론' },
  { id: 'hackenbush', name: '하켄부시 게임', aliases: ['hackenbush'], category: '게임이론' },
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
