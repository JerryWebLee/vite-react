import dayjs from "dayjs";

export const getFileNameFromResponse = (contentDisposition: string) => {
  // content-disposition: "attachment; filename*=UTF-8''%E7%9B%91%E6%B5%8B%E6%95%B0%E6%8D%AE_2024_10_08_15_21_00.xlsx.gz"
  // const encodedFileName = contentDisposition
  //   .replace(/attachment;filename*=utf-8''/, '')
  //   .trim();
  // return decodeURIComponent(encodedFileName);
  const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/i);
  if (match && match[1]) {
    return decodeURIComponent(match[1]); // 对文件名进行 URL 解码
  }
  return dayjs().format("YYYY/MM/DD HH:mm:ss");
};

export async function downloadLogFile(url: string, filename?: string) {
  // 如果没有提供文件名，则从URL中提取
  if (!filename) {
    filename = url.substring(url.lastIndexOf("/") + 1);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`下载日志失败: 日志状态${response.status}`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  // 创建一个隐藏的<a>元素用于下载
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.target = "_blank";
  a.download = filename;
  a.style.display = "none";

  // 添加到文档中并触发点击
  document.body.appendChild(a);
  a.click();

  // 清理
  document.body.removeChild(a);
}
