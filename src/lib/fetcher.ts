export const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    try {
      const info = await res.json();
      (error as any).info = info;
    } catch {
      // ignore
    }
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};
