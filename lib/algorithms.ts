export type Difficulty = '하' | '중' | '상'

export type Algorithm = {
  id: string
  name: string
  aliases: string[]
  category: string
  description: string
  difficulty: Difficulty
  difficultyReason: string
  timeComplexity: string
  useCases: string[]
  code: {
    lang: string
    label: string
    source: string
  }
  related: string[]
}

export const ALGORITHMS: Algorithm[] = [
  {
    id: 'binary-search',
    name: '이진 탐색',
    aliases: ['binary search', 'bsearch', '이분 탐색'],
    category: '탐색',
    description:
      '정렬된 배열에서 탐색 범위를 절반씩 좁혀가며 목표 값을 찾는 알고리즘입니다. 매 단계마다 중앙값과 목표 값을 비교해 왼쪽 또는 오른쪽 절반만 남기므로, 전체 데이터를 순회하지 않고도 빠르게 원하는 값을 찾을 수 있습니다.',
    difficulty: '하',
    difficultyReason:
      '개념과 구현이 간단하고 코드가 짧습니다. 다만 경계 조건(lo/hi, mid 계산, 종료 조건)에서 off-by-one 실수가 잦아 "하" 중에서도 주의가 필요합니다.',
    timeComplexity: 'O(log N)',
    useCases: [
      '정렬된 배열에서 특정 값의 존재 여부·위치 찾기',
      '"조건을 만족하는 최소/최댓값" 형태의 매개변수 탐색(파라메트릭 서치)',
      'lower_bound / upper_bound 로 삽입 위치 구하기',
      '정답이 단조적으로 변하는 최적화 문제',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid          # 찾음: 인덱스 반환
        elif arr[mid] < target:
            lo = mid + 1        # 오른쪽 절반 탐색
        else:
            hi = mid - 1        # 왼쪽 절반 탐색
    return -1                   # 존재하지 않음`,
    },
    related: ['two-pointers', 'quick-sort', 'merge-sort'],
  },
  {
    id: 'quick-sort',
    name: '퀵 정렬',
    aliases: ['quick sort', 'quicksort'],
    category: '정렬',
    description:
      '피벗(pivot)을 하나 정하고, 피벗보다 작은 값과 큰 값으로 배열을 분할한 뒤 각 부분을 재귀적으로 정렬하는 분할 정복 알고리즘입니다. 평균적으로 매우 빠르며 추가 메모리를 거의 쓰지 않는 제자리(in-place) 정렬입니다.',
    difficulty: '중',
    difficultyReason:
      '분할 정복과 재귀, 피벗 선택 전략을 이해해야 합니다. 최악의 경우(이미 정렬된 입력 등) O(N^2)로 퇴화할 수 있어 피벗 선택이 중요합니다.',
    timeComplexity: 'O(N log N) 평균 / O(N^2) 최악',
    useCases: [
      '범용 in-place 정렬이 필요할 때',
      '평균 성능이 중요하고 추가 메모리를 아끼고 싶을 때',
      'k번째 원소 찾기(퀵 셀렉트)의 기반 알고리즘',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left  = [x for x in arr if x < pivot]
    mid   = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)`,
    },
    related: ['merge-sort', 'binary-search'],
  },
  {
    id: 'merge-sort',
    name: '병합 정렬',
    aliases: ['merge sort', 'mergesort'],
    category: '정렬',
    description:
      '배열을 절반으로 계속 나눈 뒤, 정렬된 두 부분 배열을 병합(merge)하며 전체를 정렬하는 분할 정복 알고리즘입니다. 입력에 상관없이 항상 O(N log N)을 보장하고 안정 정렬(stable)이라는 장점이 있습니다.',
    difficulty: '중',
    difficultyReason:
      '분할과 병합 두 단계를 나눠 구현해야 하고, 병합 과정에서 인덱스 관리가 필요합니다. 원리는 직관적이지만 추가 배열 관리가 실수 포인트입니다.',
    timeComplexity: 'O(N log N)',
    useCases: [
      '최악의 경우에도 안정적인 성능이 필요할 때',
      '정렬의 안정성(stable)이 중요한 경우',
      '연결 리스트 정렬, 외부 정렬(대용량 파일)',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left  = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    # 두 정렬된 리스트를 병합
    result, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]`,
    },
    related: ['quick-sort', 'binary-search'],
  },
  {
    id: 'dfs',
    name: 'DFS (깊이 우선 탐색)',
    aliases: ['dfs', 'depth first search', '깊이우선탐색'],
    category: '그래프',
    description:
      '한 정점에서 시작해 갈 수 있는 곳까지 최대한 깊이 들어간 뒤, 더 갈 곳이 없으면 되돌아오며 탐색하는 방식입니다. 재귀 또는 스택으로 구현하며, 모든 경로 탐색·연결 요소 판별 등에 폭넓게 쓰입니다.',
    difficulty: '중',
    difficultyReason:
      '재귀 호출 흐름과 방문 처리(visited)를 정확히 다뤄야 합니다. 개념 자체는 쉽지만 백트래킹·사이클 판별 등으로 확장되면 난도가 올라갑니다.',
    timeComplexity: 'O(V + E)',
    useCases: [
      '그래프의 모든 경로/조합 탐색',
      '연결 요소(Connected Component) 개수 세기',
      '사이클 판별, 위상 정렬',
      '미로에서 도달 가능성 확인',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def dfs(graph, start):
    visited = set()

    def visit(node):
        visited.add(node)
        print(node, end=' ')       # 방문 처리
        for nxt in graph[node]:
            if nxt not in visited:
                visit(nxt)         # 더 깊이 탐색

    visit(start)
    return visited`,
    },
    related: ['bfs', 'backtracking', 'union-find'],
  },
  {
    id: 'bfs',
    name: 'BFS (너비 우선 탐색)',
    aliases: ['bfs', 'breadth first search', '너비우선탐색'],
    category: '그래프',
    description:
      '시작 정점에서 가까운 정점부터 차례로, 같은 거리의 정점을 모두 방문한 뒤 다음 단계로 넘어가는 탐색 방식입니다. 큐(queue)를 사용하며, 가중치가 없는 그래프에서 최단 경로를 찾을 때 특히 유용합니다.',
    difficulty: '중',
    difficultyReason:
      '큐를 이용한 레벨 단위 탐색과 방문 처리 시점을 이해해야 합니다. DFS와 함께 그래프 탐색의 기본기로, 최단 거리 응용에서 자주 등장합니다.',
    timeComplexity: 'O(V + E)',
    useCases: [
      '가중치 없는 그래프의 최단 경로/최소 이동 횟수',
      '레벨(단계) 단위 탐색',
      '미로 최단 거리, 감염/확산 시뮬레이션',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        print(node, end=' ')
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)   # 큐에 넣을 때 방문 처리
                queue.append(nxt)
    return visited`,
    },
    related: ['dfs', 'dijkstra'],
  },
  {
    id: 'dijkstra',
    name: '다익스트라',
    aliases: ['dijkstra', '다익스트라 최단경로'],
    category: '그래프',
    description:
      '음의 가중치가 없는 그래프에서 한 시작점으로부터 모든 정점까지의 최단 거리를 구하는 알고리즘입니다. 우선순위 큐(최소 힙)를 사용해 현재 가장 가까운 정점을 반복적으로 확정해 나갑니다.',
    difficulty: '상',
    difficultyReason:
      '우선순위 큐, 거리 배열 갱신(relaxation), 방문 확정 로직이 함께 얽혀 있습니다. 힙 사용과 시간복잡도 최적화까지 요구되어 난도가 높습니다.',
    timeComplexity: 'O(E log V)',
    useCases: [
      '가중치가 있는 그래프의 최단 경로',
      '네트워크 라우팅, 지도 길찾기',
      '최소 비용 이동 문제',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `import heapq

def dijkstra(graph, start, n):
    dist = [float('inf')] * n
    dist[start] = 0
    pq = [(0, start)]              # (거리, 노드)
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue              # 이미 더 짧은 경로 확정됨
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    },
    related: ['bfs', 'greedy', 'dynamic-programming'],
  },
  {
    id: 'dynamic-programming',
    name: '다이나믹 프로그래밍',
    aliases: ['dp', 'dynamic programming', '동적 계획법'],
    category: '최적화',
    description:
      '큰 문제를 작은 부분 문제로 나누고, 부분 문제의 답을 저장(메모이제이션)해 중복 계산을 피하는 기법입니다. 부분 문제의 최적해가 전체 최적해를 이루는 "최적 부분 구조"와 "중복 부분 문제" 조건이 성립할 때 사용합니다.',
    difficulty: '상',
    difficultyReason:
      '상태(state) 정의와 점화식(전이) 설계가 문제마다 달라 정형화가 어렵습니다. 발상 자체가 까다로워 알고리즘 학습에서 가장 어려운 축에 속합니다.',
    timeComplexity: '문제마다 다름 (예: O(N), O(N·M))',
    useCases: [
      '피보나치, 계단 오르기 같은 점화식 문제',
      '배낭 문제(Knapsack), 동전 교환',
      '최장 증가 부분 수열(LIS), 편집 거리',
      '경우의 수 세기, 최적 비용/이익 계산',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def knapsack(weights, values, capacity):
    n = len(weights)
    # dp[w] = 무게 한도 w 에서의 최대 가치
    dp = [0] * (capacity + 1)
    for i in range(n):
        # 뒤에서부터 갱신해야 각 물건을 한 번만 사용
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[capacity]`,
    },
    related: ['greedy', 'backtracking', 'dijkstra'],
  },
  {
    id: 'greedy',
    name: '그리디',
    aliases: ['greedy', '탐욕법'],
    category: '최적화',
    description:
      '매 순간 지금 당장 가장 좋아 보이는 선택을 하는 방식으로 전체 답을 구성하는 기법입니다. 지역 최적해가 전역 최적해로 이어진다는 것이 보장될 때만 올바른 답을 주며, 그 증명이 핵심입니다.',
    difficulty: '중',
    difficultyReason:
      '구현은 대체로 짧고 간단하지만, "그리디로 풀어도 되는가"를 판단·증명하는 것이 어렵습니다. 잘못 적용하면 반례에 걸리기 쉽습니다.',
    timeComplexity: '보통 O(N log N) (정렬 포함)',
    useCases: [
      '회의실 배정, 활동 선택 문제',
      '거스름돈 최소 개수(동전 단위가 배수일 때)',
      '최소 신장 트리(크루스칼)',
      '정렬 후 순차 선택으로 풀리는 문제',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def activity_selection(intervals):
    # 끝나는 시간이 빠른 순으로 정렬
    intervals.sort(key=lambda x: x[1])
    count, end = 0, float('-inf')
    for s, e in intervals:
        if s >= end:          # 겹치지 않으면 선택
            count += 1
            end = e
    return count`,
    },
    related: ['dynamic-programming', 'dijkstra', 'two-pointers'],
  },
  {
    id: 'backtracking',
    name: '백트래킹',
    aliases: ['backtracking', '퇴각검색'],
    category: '탐색',
    description:
      '가능한 경우를 하나씩 시도하다가 조건을 위반하면 즉시 되돌아가(가지치기) 불필요한 탐색을 줄이는 기법입니다. DFS를 기반으로 하되, 유망하지 않은 후보를 미리 잘라내는 것이 핵심입니다.',
    difficulty: '상',
    difficultyReason:
      '상태 공간 트리를 그리며 재귀·가지치기 조건을 설계해야 합니다. 경우의 수가 폭발하기 쉬워 효율적인 가지치기 설계가 요구됩니다.',
    timeComplexity: '지수 시간(가지치기로 감소)',
    useCases: [
      'N-Queen, 스도쿠',
      '순열·조합·부분집합 생성',
      '조건을 만족하는 모든 해 탐색',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def permutations(nums):
    result, used = [], [False] * len(nums)
    path = []

    def backtrack():
        if len(path) == len(nums):
            result.append(path[:])   # 완성된 순열 저장
            return
        for i in range(len(nums)):
            if used[i]:
                continue             # 가지치기
            used[i] = True; path.append(nums[i])
            backtrack()
            used[i] = False; path.pop()   # 되돌리기

    backtrack()
    return result`,
    },
    related: ['dfs', 'dynamic-programming'],
  },
  {
    id: 'union-find',
    name: '유니온 파인드',
    aliases: ['union find', 'disjoint set', '분리 집합', 'dsu'],
    category: '자료구조',
    description:
      '원소들을 여러 집합으로 그룹화하고, 두 원소가 같은 집합에 속하는지(find) 확인하거나 두 집합을 합치는(union) 연산을 매우 빠르게 처리하는 자료구조입니다. 경로 압축과 랭크 기반 합치기로 거의 상수 시간에 동작합니다.',
    difficulty: '중',
    difficultyReason:
      '개념은 명확하나 경로 압축(path compression)과 union by rank 최적화를 함께 구현해야 제 성능이 나옵니다. 응용 문제에서 "언제 쓸지" 파악이 관건입니다.',
    timeComplexity: 'O(α(N)) ≈ O(1)',
    useCases: [
      '그래프의 연결 요소·사이클 판별',
      '최소 신장 트리(크루스칼)에서 사이클 체크',
      '네트워크 연결 여부, 그룹 병합',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `parent = list(range(n))

def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])   # 경로 압축
    return parent[x]

def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[rb] = ra               # 두 집합 합치기`,
    },
    related: ['dfs', 'greedy'],
  },
  {
    id: 'two-pointers',
    name: '투 포인터',
    aliases: ['two pointers', '두 포인터'],
    category: '배열',
    description:
      '배열 위에서 두 개의 포인터(인덱스)를 상황에 따라 이동시키며 원하는 구간이나 쌍을 찾는 기법입니다. 정렬된 배열이나 구간 합 문제에서 이중 반복문을 선형 시간으로 줄여줍니다.',
    difficulty: '하',
    difficultyReason:
      '두 인덱스의 이동 조건만 잘 정하면 구현이 간단합니다. 다만 포인터 이동 조건을 잘못 잡으면 놓치는 경우가 생겨 논리 설계가 중요합니다.',
    timeComplexity: 'O(N)',
    useCases: [
      '정렬된 배열에서 합이 특정 값인 두 수 찾기',
      '구간 합이 조건을 만족하는 부분 배열 찾기',
      '정렬된 두 배열 병합',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def two_sum_sorted(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        cur = arr[lo] + arr[hi]
        if cur == target:
            return (lo, hi)
        elif cur < target:
            lo += 1        # 합을 키운다
        else:
            hi -= 1        # 합을 줄인다
    return None`,
    },
    related: ['sliding-window', 'binary-search'],
  },
  {
    id: 'sliding-window',
    name: '슬라이딩 윈도우',
    aliases: ['sliding window', '윈도우'],
    category: '배열',
    description:
      '연속된 구간(윈도우)을 유지하면서 양 끝을 조절해 부분 배열/부분 문자열 문제를 선형 시간에 푸는 기법입니다. 윈도우를 넓히거나 좁히며 조건을 만족하는 최적 구간을 찾습니다.',
    difficulty: '중',
    difficultyReason:
      '윈도우를 늘리고 줄이는 조건과 그 안의 상태(합, 개수 등)를 동시에 관리해야 합니다. 투 포인터의 응용으로, 조건 설계에서 실수가 나기 쉽습니다.',
    timeComplexity: 'O(N)',
    useCases: [
      '길이가 K인 구간의 최대/최소 합',
      '조건을 만족하는 최소/최대 길이 부분 배열',
      '중복 없는 가장 긴 부분 문자열',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def max_sum_window(arr, k):
    window = sum(arr[:k])
    best = window
    for i in range(k, len(arr)):
        window += arr[i] - arr[i - k]   # 오른쪽 추가, 왼쪽 제거
        best = max(best, window)
    return best`,
    },
    related: ['two-pointers', 'binary-search'],
  },
  {
    id: 'kmp',
    name: 'KMP 문자열 매칭',
    aliases: ['kmp', 'knuth morris pratt', '문자열 매칭'],
    category: '문자열',
    description:
      '텍스트에서 패턴 문자열을 찾을 때, 실패 함수(부분 일치 테이블)를 미리 계산해 불일치가 발생해도 이미 비교한 부분을 다시 검사하지 않도록 하는 알고리즘입니다. 덕분에 선형 시간에 매칭이 가능합니다.',
    difficulty: '상',
    difficultyReason:
      '실패 함수(prefix function)의 의미와 구성 원리를 이해하기가 까다롭습니다. 인덱스 되돌림 로직이 직관적이지 않아 난도가 높습니다.',
    timeComplexity: 'O(N + M)',
    useCases: [
      '긴 텍스트에서 패턴 등장 위치 모두 찾기',
      '문자열의 주기성 분석',
      '표절/중복 문자열 탐지',
    ],
    code: {
      lang: 'python',
      label: 'Python',
      source: `def kmp(text, pattern):
    # 실패 함수 계산
    pi = [0] * len(pattern)
    j = 0
    for i in range(1, len(pattern)):
        while j and pattern[i] != pattern[j]:
            j = pi[j - 1]
        if pattern[i] == pattern[j]:
            j += 1
            pi[i] = j
    # 매칭
    res, j = [], 0
    for i in range(len(text)):
        while j and text[i] != pattern[j]:
            j = pi[j - 1]
        if text[i] == pattern[j]:
            j += 1
            if j == len(pattern):
                res.append(i - j + 1)
                j = pi[j - 1]
    return res`,
    },
    related: ['two-pointers'],
  },
]

export function getAlgorithm(id: string): Algorithm | undefined {
  return ALGORITHMS.find((a) => a.id === id)
}

export function searchAlgorithms(query: string): Algorithm[] {
  const q = query.trim().toLowerCase()
  if (!q) return ALGORITHMS
  return ALGORITHMS.filter((a) => {
    const hay = [a.name, a.category, ...a.aliases].join(' ').toLowerCase()
    return hay.includes(q)
  })
}

// ---- 문제 검색용 더미 데이터 ----

export type Solution = {
  id: string
  label: string
  algorithmId: string
  explanation: string
  timeComplexity: string
}

export type ProblemResult = {
  problem: string
  difficulty: Difficulty
  difficultyReason: string
  solutions: Solution[]
}

export const MOCK_PROBLEM_RESULT: ProblemResult = {
  problem:
    'N개의 회의 시작·종료 시간이 주어질 때, 한 회의실에서 시간이 겹치지 않게 진행할 수 있는 회의의 최대 개수를 구하세요.',
  difficulty: '중',
  difficultyReason:
    '정렬 후 규칙을 찾으면 코드는 짧지만, "왜 끝나는 시간 기준 정렬이 최적인지"를 떠올리는 통찰이 필요합니다. 그리디의 정당성을 이해하면 쉽지만 모르면 헤매기 쉬운 중급 문제입니다.',
  solutions: [
    {
      id: 'sol-greedy',
      label: '풀이 1 · 그리디',
      algorithmId: 'greedy',
      explanation:
        '회의를 "끝나는 시간"이 빠른 순으로 정렬한 뒤, 앞에서부터 현재까지 선택한 회의의 종료 시간과 겹치지 않는 회의를 차례로 고릅니다. 가장 빨리 끝나는 회의를 고를수록 남는 시간이 많아져 더 많은 회의를 넣을 수 있다는 것이 핵심 통찰입니다. 이 방식이 항상 최적임이 증명되어 있어 그리디로 안전하게 풀 수 있습니다.',
      timeComplexity: 'O(N log N)',
    },
    {
      id: 'sol-dp',
      label: '풀이 2 · DP',
      algorithmId: 'dynamic-programming',
      explanation:
        '가중치(중요도)가 회의마다 다른 확장 버전(가중 활동 선택)이라면 단순 그리디로는 최적이 보장되지 않습니다. 이때는 끝나는 시간 순 정렬 후, 각 회의에 대해 "이 회의를 포함할 때 겹치지 않는 가장 늦은 이전 회의"를 이진 탐색으로 찾아 dp[i] = max(dp[i-1], value[i] + dp[prev]) 점화식으로 풀 수 있습니다.',
      timeComplexity: 'O(N log N)',
    },
  ],
}
