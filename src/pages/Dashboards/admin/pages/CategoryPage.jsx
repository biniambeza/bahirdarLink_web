// src/pages/CategoryPage.jsx
import React from "react";

const CategoryPage = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <p className="text-gray-700">
        This is the Category page. You can manage all categories here.
      </p>

      {/* Example Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="py-2 px-4 border-b">1</td>
              <td className="py-2 px-4 border-b">Medical</td>
              <td className="py-2 px-4 border-b">Medical emergencies</td>
            </tr>
            <tr className="text-center">
              <td className="py-2 px-4 border-b">2</td>
              <td className="py-2 px-4 border-b">Fire</td>
              <td className="py-2 px-4 border-b">Fire-related emergencies</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryPage;
