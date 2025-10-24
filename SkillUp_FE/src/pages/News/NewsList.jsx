import React, { useEffect, useState } from "react";
import { getAllNews } from "../../api/newsAPI";
import { useNavigate } from "react-router-dom";

export default function NewsList() {
  const [newsList, setNewsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getAllNews();
      setNewsList(data);
    })();
  }, []);

  const handleClick = (id) => {
    navigate(`/news/${id}`);
  };

  // Extract first image and plain text
  const extractImageAndText = (htmlContent) => {
    if (!htmlContent) return { image: null, text: "" };

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    const imgTag = doc.querySelector("img");
    const image = imgTag ? imgTag.src : null;
    if (imgTag) imgTag.remove();

    const text = doc.body.textContent || "";
    return { image, text };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {newsList.length === 0 ? (
        <p className="text-center text-gray-500">No news available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((news) => {
            const { image, text } = extractImageAndText(news.contents);

            return (
              <div
                key={news.id}
                onClick={() => handleClick(news.id)}
                className="cursor-pointer border rounded-xl bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
              >
                <img
                  src={image || news.imageUrl || "https://via.placeholder.com/400x250"}
                  alt={news.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-bold text-lg mb-2 hover:text-blue-600 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {text.trim()}
                    </p>
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(news.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
