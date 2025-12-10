import { useCallback, useEffect } from "react";

function SearchComponent({ query }: { query: string }) {
  // 如果不用 useCallback，每次渲染 fetchData 都是新的
  const fetchData = useCallback(() => {
    const url = `https://api.example.com/search?q=${query}`;
    // 执行请求...
    console.log("Fetching:", url);
  }, [query]); // 只有 query 变了，fetchData 才会变

  useEffect(() => {
    fetchData();
    // 因为 fetchData 被缓存了，只有 query 变了导致 fetchData 变了，effect 才会执行
  }, [fetchData]);

  return <div>Search results...</div>;
}

export default function Demo2() {
  return <SearchComponent query="react" />;
}
