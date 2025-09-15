//? ========= START API ===========
//? ========= START API ===========

import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";

// Bind the modal to the main app element
Modal.setAppElement("#root");

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [parentCategoryFilter, setParentCategoryFilter] = useState("");
  const limit = 10;

  // States for managing the edit form and modal
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    product_name: "",
    product_price: "",
    product_id: "",
    product_description: "",
    product_quantity: "",
    category_id: "",
  });
  const [imageFile, setImageFile] = useState(null);

  // States for managing the delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // دالة جلب المنتجات
  const fetchList = async (page = 1, retryCount = 0) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const requestUrl = `${backendUrl}/api/products?limit=${limit}&page=${page}`;
      const response = await axios.get(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      let products = [];
      if (Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (response.data.data?.products) {
        products = response.data.data.products;
      }

      let totalPagesCalc = 1;
      const pagination = response.data.data?.pagination || {};
      if (pagination.last_page) {
        totalPagesCalc = pagination.last_page;
      } else {
        const totalProducts = response.data.total || products.length;
        totalPagesCalc = Math.ceil(totalProducts / limit);
        if (products.length < limit) {
          totalPagesCalc = page;
        } else if (products.length === limit) {
          totalPagesCalc = page + 1;
        }
      }

      if (Array.isArray(products) && products.length > 0) {
        setList(products.reverse());
        setTotalPages(totalPagesCalc);
      } else {
        if (retryCount < 2) {
          setTimeout(() => fetchList(page, retryCount + 1), 1000);
        } else {
          toast.error(response.data.message || t("list.noProducts"));
          setList([]);
          setTotalPages(1);
        }
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        toast.error(t("errors.network"));
      } else if (error.response) {
        toast.error(
          t("errors.server", {
            status: error.response.status,
            message: error.response.data.message || error.message,
          })
        );
      } else {
        toast.error(t("errors.generic"));
      }
      setList([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // دالة جلب الفئات
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/categories?limit=40`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        let categoriesArray = [];
        if (Array.isArray(response.data.data)) {
          categoriesArray = response.data.data;
        } else if (
          response.data.data &&
          Array.isArray(response.data.data.categories)
        ) {
          categoriesArray = response.data.data.categories;
        } else {
          throw new Error("البنية غير صالحة: بيانات الفئات غير موجودة");
        }
        const formattedCategories = categoriesArray.map((category) => ({
          id: category.category_id,
          name: category.category_name,
          slugs: category.category_slugs,
        }));
        setCategories(formattedCategories);
      } else {
        throw new Error(response.data.message || "فشل في جلب الفئات");
      }
    } catch (error) {
      toast.error(error.message || t("errors.generic"));
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // دالة إظهار نافذة تأكيد الحذف
  const confirmDeleteProduct = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // دالة إغلاق نافذة تأكيد الحذف
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // دالة حذف منتج
  const removeProduct = async () => {
    if (isLoading || !productToDelete || !productToDelete.product_id) return;
    setIsLoading(true);
    try {
      const deleteUrl = `${backendUrl}/api/products/${productToDelete.product_id}?_method=DELETE`;
      const response = await axios.request({
        method: "DELETE",
        url: deleteUrl,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        toast.success(response.data.message || "تم حذف المنتج بنجاح");
        setList((prevList) => {
          const updatedList = prevList.filter(
            (item) => item.product_id !== productToDelete.product_id
          );
          return updatedList;
        });
        await fetchList(currentPage);
      } else {
        toast.error(response.data.message || "فشل في حذف المنتج");
        await fetchList(currentPage);
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        toast.error(t("errors.network"));
      } else if (error.response) {
        toast.error(
          t("errors.server", {
            status: error.response.status,
            message: error.response.data.message || error.message,
          })
        );
        await fetchList(currentPage);
      } else {
        toast.error(error.message || t("errors.generic"));
        await fetchList(currentPage);
      }
    } finally {
      setIsLoading(false);
      closeDeleteModal();
    }
  };

  // دالة فتح نموذج التحديث في المودال
  const openEditForm = (item) => {
    setEditItem(item);
    setEditFormData({
      product_name: item.product_name || "",
      product_price: item.product_price || "",
      product_id: item.product_id || "",
      product_description: item.product_description || "",
      product_quantity: item.product_quantity || "",
      category_id: item.category?.category_id || "",
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  // دالة إغلاق المودال
  const closeEditForm = () => {
    setIsModalOpen(false);
    setEditItem(null);
    setEditFormData({
      product_name: "",
      product_price: "",
      product_id: "",
      product_description: "",
      product_quantity: "",
      category_id: "",
    });
    setImageFile(null);
  };

  // دالة التعامل مع تغييرات الحقول في النموذج
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // دالة التعامل مع اختيار ملف الصورة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validImageTypes.includes(file.type)) {
        toast.error("يرجى اختيار صورة بصيغة PNG أو JPG أو JPEG");
        setImageFile(null);
        return;
      }
      setImageFile(file);
    }
  };

  // دالة تحديث المنتج
  const updateProduct = async () => {
    if (isLoading) return;

    if (
      !editFormData.product_name ||
      !editFormData.product_description ||
      !editFormData.product_price ||
      !editFormData.product_quantity ||
      !editFormData.category_id
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      const updateUrl = `${backendUrl}/api/products/${editFormData.product_id}`;
      const formData = new FormData();
      formData.append("name", editFormData.product_name);
      formData.append("description", editFormData.product_description);
      formData.append("price", parseFloat(editFormData.product_price));
      formData.append("quantity", parseInt(editFormData.product_quantity, 10));
      formData.append("category_id", parseInt(editFormData.category_id, 10));
      formData.append("_method", "PUT");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axios.post(updateUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === 200) {
        toast.success(response.data.message || "تم تحديث المنتج بنجاح");
        setList((prevList) =>
          prevList.map((item) =>
            item.product_id === editFormData.product_id
              ? {
                  ...item,
                  product_name: editFormData.product_name,
                  product_description: editFormData.product_description,
                  product_price: editFormData.product_price,
                  product_quantity: editFormData.product_quantity,
                  category:
                    categories.find(
                      (cat) => cat.id === parseInt(editFormData.category_id, 10)
                    ) || item.category,
                  product_image: imageFile
                    ? URL.createObjectURL(imageFile)
                    : item.product_image,
                }
              : item
          )
        );
        closeEditForm();
        await fetchList(currentPage);
      } else {
        toast.error(response.data.message || "فشل في تحديث المنتج");
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        toast.error("غير قادر على الاتصال بالخادم. لم يتم حفظ التغييرات.");
      } else if (error.response) {
        const errorMessage =
          error.response.data.message || "خطأ في التحقق من البيانات";
        toast.error(
          `خطأ في الخادم: ${error.response.status} - ${errorMessage}`
        );
        if (error.response.data.errors) {
          Object.values(error.response.data.errors).forEach((err) => {
            toast.error(err);
          });
        }
      } else {
        toast.error(error.message || "حدث خطأ أثناء تحديث المنتج");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // دالة التعامل مع تغيير الصفحة
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchList(newPage);
    }
  };

  // تصفية الكاتيجوري الأب فقط (parent: null أو غير موجود)
  const parentCategories = categories.filter((cat) => !cat.parent);

  // تصفية المنتجات حسب الكاتيجوري الأب المختار
  const filteredList = parentCategoryFilter
    ? list.filter((item) => {
        if (!item.category) return false;
        if (item.category.category_id === Number(parentCategoryFilter))
          return true;
        if (
          item.category.parent &&
          item.category.parent.category_id === Number(parentCategoryFilter)
        )
          return true;
        return false;
      })
    : list;

  // جلب المنتجات والفئات عند تحميل المكون أو تغيير الصفحة
  useEffect(() => {
    if (token && !isLoading) {
      fetchList(currentPage);
      fetchCategories();
    } else if (!token) {
      toast.error("يرجى تسجيل الدخول لعرض المنتجات");
      setList([]);
    }
  }, [token, currentPage]);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {/* parent category filter */}
        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="parentCategoryFilter" className="font-semibold">
            {t("list.filterByParent")}
          </label>
          <select
            id="parentCategoryFilter"
            value={parentCategoryFilter}
            onChange={(e) => setParentCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">{t("list.allCategories")}</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* عدد المنتجات المعروضة */}
        <div className="mb-2 font-semibold">
          {t("list.itemsShown")}: {filteredList.length}
        </div>
        <p className="mb-2">{t("list.allProducts")}</p>
        {isLoading && <p>{t("list.loadingProducts")}</p>}
        {filteredList.length === 0 && !isLoading && (
          <p>{t("list.noProducts")}</p>
        )}
        {filteredList.length > 0 && (
          <div className="flex-grow flex flex-col gap-2 ">
            <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
              <b>{t("list.colImage")}</b>
              <b>{t("list.colName")}</b>
              <b>{t("list.colCategory")}</b>
              <b>{t("list.colPrice")}</b>
              <b className="text-center">{t("list.colDelete")}</b>
              <b className="text-center">{t("list.colEdit")}</b>
            </div>

            {filteredList.map((item) => (
              <div
                key={item.product_id}
                className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
              >
                <img
                  className="w-12"
                  src={item.product_image || "placeholder-image-url"}
                  alt={item.product_name || "المنتج"}
                />
                <p>{item.product_name || "غير متوفر"}</p>
                <p>{item.category?.category_name || t("list.notAvailable")}</p>
                <p>
                  {currency}
                  {item.product_price || "0.00"}
                </p>
                <p
                  onClick={() => confirmDeleteProduct(item)}
                  className="text-center cursor-pointer text-lg"
                >
                  X
                </p>
                <p
                  onClick={() => openEditForm(item)}
                  className="text-center cursor-pointer text-lg"
                >
                  ✏️
                </p>
              </div>
            ))}
          </div>
        )}

        {/* نافذة تأكيد الحذف */}
        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={closeDeleteModal}
          className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-40"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <h2 className="text-lg font-bold mb-4">
            {t("list.deleteConfirmTitle")}
          </h2>
          <div className="flex flex-col items-center mb-4">
            {productToDelete && (
              <img
                className="w-16 h-16 mb-2 object-cover"
                src={productToDelete.product_image || "placeholder-image-url"}
                alt={productToDelete.product_name || "المنتج"}
              />
            )}
            <p>
              {t("list.deleteConfirmText")}{" "}
              <span className="font-semibold">
                {productToDelete?.product_name || t("list.unknown")}
              </span>
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={removeProduct}
              className="bg-red-500 text-white rounded px-4 py-2 disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? t("list.deleting") : t("list.deleteConfirmYes")}
            </button>
            <button
              onClick={closeDeleteModal}
              className="bg-gray-500 text-white rounded px-4 py-2"
            >
              {t("app.cancel")}
            </button>
          </div>
        </Modal>

        {/* نافذة منبثقة لتعديل المنتج */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeEditForm}
          className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-20"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <h2 className="text-xl font-bold mb-4">{t("list.editProduct")}</h2>
          {editItem && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm mb-1">
                  {t("list.labelProductName")}
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={editFormData.product_name}
                  onChange={handleEditFormChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t("list.labelDescription")}
                </label>
                <input
                  type="text"
                  name="product_description"
                  value={editFormData.product_description}
                  onChange={handleEditFormChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t("list.labelPrice")}
                </label>
                <input
                  type="number"
                  name="product_price"
                  value={editFormData.product_price}
                  onChange={handleEditFormChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t("list.labelQuantity")}
                </label>
                <input
                  type="number"
                  name="product_quantity"
                  value={editFormData.product_quantity}
                  onChange={handleEditFormChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t("list.labelCategory")}
                </label>
                <select
                  name="category_id"
                  value={editFormData.category_id}
                  onChange={handleEditFormChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                >
                  <option value="">{t("list.chooseCategory")}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-sm text-red-500">
                    {t("list.noCategoriesAvailable")}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t("list.labelProductId")}
                </label>
                <input
                  type="text"
                  name="product_id"
                  value={editFormData.product_id}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  رفع صورة (PNG، JPG، JPEG):
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageChange}
                  className="border rounded px-2 py-1 w-full"
                />
                {imageFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    الصورة المختارة: {imageFile.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => updateProduct()}
                  className="bg-green-500 text-white rounded px-4 py-2 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {isLoading ? t("list.saving") : t("app.save")}
                </button>
                <button
                  onClick={closeEditForm}
                  className="bg-red-500 text-white rounded px-4 py-2"
                >
                  {t("app.cancel")}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* أزرار التنقل بين الصفحات */}
        <div className="mt-5 flex justify-center gap-4 py-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            {t("pagination.previous")}
          </button>

          <span className="px-4 py-2">
            {t("pagination.page")} {currentPage} {t("pagination.of")}{" "}
            {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            {t("pagination.next")}
          </button>
        </div>
      </div>
    </>
  );
};

export default List;

//? ========= end API ===========
//? ========= end API ===========

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { backendUrl, currency } from '../App';
// import { toast } from 'react-toastify';
// import Modal from 'react-modal';

// // Bind the modal to the main app element
// Modal.setAppElement('#root');

// const List = ({ token }) => {
//   const [list, setList] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [categories, setCategories] = useState([]);
//   const limit = 10;

//   // States for managing the edit form and modal
//   const [editItem, setEditItem] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editFormData, setEditFormData] = useState({
//     product_name: '',
//     product_price: '',
//     product_id: '',
//     product_description: '',
//     product_quantity: '',
//     category_id: '',
//   });
//   const [imageFile, setImageFile] = useState(null);
//   const [imageFile2, setImageFile2] = useState(null);
//   const [imageFile3, setImageFile3] = useState(null);
//   const [imageFile4, setImageFile4] = useState(null);

//   // States for managing the delete confirmation modal
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [productToDelete, setProductToDelete] = useState(null);

//   // دالة جلب المنتجات
//   const fetchList = async (page = 1, retryCount = 0) => {
//     if (isLoading) return;
//     setIsLoading(true);
//     try {
//       const requestUrl = `${backendUrl}/api/products?limit=${limit}&page=${page}`;
//       const response = await axios.get(requestUrl, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Cache-Control': 'no-cache',
//         },
//       });

//       let products = [];
//       if (Array.isArray(response.data.data)) {
//         products = response.data.data;
//       } else if (response.data.data?.products) {
//         products = response.data.data.products;
//       }

//       let totalPagesCalc = 1;
//       const pagination = response.data.data?.pagination || {};
//       if (pagination.last_page) {
//         totalPagesCalc = pagination.last_page;
//       } else {
//         const totalProducts = response.data.total || products.length;
//         totalPagesCalc = Math.ceil(totalProducts / limit);
//         if (products.length < limit) {
//           totalPagesCalc = page;
//         } else if (products.length === limit) {
//           totalPagesCalc = page + 1;
//         }
//       }

//       if (Array.isArray(products) && products.length > 0) {
//         setList(products.reverse());
//         setTotalPages(totalPagesCalc);
//       } else {
//         if (retryCount < 2) {
//           setTimeout(() => fetchList(page, retryCount + 1), 1000);
//         } else {
//           toast.error(response.data.message || 'لا توجد منتجات');
//           setList([]);
//           setTotalPages(1);
//         }
//       }
//     } catch (error) {
//       if (error.code === 'ERR_NETWORK') {
//         toast.error('غير قادر على الاتصال بالخادم. يرجى التحقق من حالة الخادم.');
//       } else if (error.response) {
//         toast.error(`خطأ في الخادم: ${error.response.status} - ${error.response.data.message || error.message}`);
//       } else {
//         toast.error('حدث خطأ أثناء جلب المنتجات');
//       }
//       setList([]);
//       setTotalPages(1);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // دالة جلب الفئات
//   const fetchCategories = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get(`${backendUrl}/api/categories`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data.status === 200 && Array.isArray(response.data.data)) {
//         const formattedCategories = response.data.data.map((category) => ({
//           id: category.category_id,
//           name: category.category_name,
//           slugs: category.category_slugs,
//         }));
//         setCategories(formattedCategories);
//       } else {
//         throw new Error(response.data.message || 'فشل في جلب الفئات');
//       }
//     } catch (error) {
//       toast.error(error.message || 'حدث خطأ أثناء جلب الفئات');
//       setCategories([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // دالة إظهار نافذة تأكيد الحذف
//   const confirmDeleteProduct = (product) => {
//     setProductToDelete(product);
//     setIsDeleteModalOpen(true);
//   };

//   // دالة إغلاق نافذة تأكيد الحذف
//   const closeDeleteModal = () => {
//     setIsDeleteModalOpen(false);
//     setProductToDelete(null);
//   };

//   // دالة حذف منتج
//   const removeProduct = async () => {
//     if (isLoading || !productToDelete || !productToDelete.product_id) return;
//     setIsLoading(true);
//     try {
//       const deleteUrl = `${backendUrl}/api/products/${productToDelete.product_id}?_method=DELETE`;
//       const response = await axios.request({
//         method: 'DELETE',
//         url: deleteUrl,
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.status === 200) {
//         toast.success(response.data.message || 'تم حذف المنتج بنجاح');
//         setList((prevList) => {
//           const updatedList = prevList.filter((item) => item.product_id !== productToDelete.product_id);
//           return updatedList;
//         });
//         await fetchList(currentPage);
//       } else {
//         toast.error(response.data.message || 'فشل في حذف المنتج');
//         await fetchList(currentPage);
//       }
//     } catch (error) {
//       if (error.code === 'ERR_NETWORK') {
//         toast.error('غير قادر على الاتصال بالخادم. لم يتم حفظ التغييرات.');
//       } else if (error.response) {
//         toast.error(`خطأ في الخادم: ${error.response.status} - ${error.response.data.message || error.message}`);
//         await fetchList(currentPage);
//       } else {
//         toast.error(error.message || 'حدث خطأ أثناء حذف المنتج');
//         await fetchList(currentPage);
//       }
//     } finally {
//       setIsLoading(false);
//       closeDeleteModal();
//     }
//   };

//   // دالة فتح نموذج التحديث في المودال
//   const openEditForm = (item) => {
//     setEditItem(item);
//     setEditFormData({
//       product_name: item.product_name || '',
//       product_price: item.product_price || '',
//       product_id: item.product_id || '',
//       product_description: item.product_description || '',
//       product_quantity: item.product_quantity || '',
//       category_id: item.category?.category_id || '',
//     });
//     setImageFile(null);
//     setImageFile2(null);
//     setImageFile3(null);
//     setImageFile4(null);
//     setIsModalOpen(true);
//   };

//   // دالة إغلاق المودال
//   const closeEditForm = () => {
//     setIsModalOpen(false);
//     setEditItem(null);
//     setEditFormData({
//       product_name: '',
//       product_price: '',
//       product_id: '',
//       product_description: '',
//       product_quantity: '',
//       category_id: '',
//     });
//     setImageFile(null);
//     setImageFile2(null);
//     setImageFile3(null);
//     setImageFile4(null);
//   };

//   // دالة التعامل مع تغييرات الحقول في النموذج
//   const handleEditFormChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   // دالة التعامل مع اختيار ملفات الصور
//   const handleImageChange = (e, imageField) => {
//     const file = e.target.files[0];
//     if (file) {
//       const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
//       if (!validImageTypes.includes(file.type)) {
//         toast.error('يرجى اختيار صورة بصيغة PNG أو JPG أو JPEG');
//         return;
//       }
//       switch (imageField) {
//         case 'image':
//           setImageFile(file);
//           break;
//         case 'image_2':
//           setImageFile2(file);
//           break;
//         case 'image_3':
//           setImageFile3(file);
//           break;
//         case 'image_4':
//           setImageFile4(file);
//           break;
//         default:
//           break;
//       }
//     }
//   };

//   // دالة تحديث المنتج
//   const updateProduct = async () => {
//     if (isLoading) return;

//     if (
//       !editFormData.product_name ||
//       !editFormData.product_description ||
//       !editFormData.product_price ||
//       !editFormData.product_quantity ||
//       !editFormData.category_id
//     ) {
//       toast.error('يرجى ملء جميع الحقول المطلوبة');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const updateUrl = `${backendUrl}/api/products/${editFormData.product_id}`;
//       const formData = new FormData();
//       formData.append('name', editFormData.product_name);
//       formData.append('description', editFormData.product_description);
//       formData.append('price', parseFloat(editFormData.product_price));
//       formData.append('quantity', parseInt(editFormData.product_quantity, 10));
//       formData.append('category_id', parseInt(editFormData.category_id, 10));
//       formData.append('_method', 'PUT');
//       if (imageFile) {
//         formData.append('image', imageFile);
//       }
//       if (imageFile2) {
//         formData.append('image_2', imageFile2);
//       }
//       if (imageFile3) {
//         formData.append('image_3', imageFile3);
//       }
//       if (imageFile4) {
//         formData.append('image_4', imageFile4);
//       }

//       const response = await axios.post(updateUrl, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (response.data.status === 200) {
//         toast.success(response.data.message || 'تم تحديث المنتج بنجاح');
//         setList((prevList) =>
//           prevList.map((item) =>
//             item.product_id === editFormData.product_id
//               ? {
//                 ...item,
//                 product_name: editFormData.product_name,
//                 product_description: editFormData.product_description,
//                 product_price: editFormData.product_price,
//                 product_quantity: editFormData.product_quantity,
//                 category: categories.find(
//                   (cat) => cat.id === parseInt(editFormData.category_id, 10)
//                 ) || item.category,
//                 product_image: imageFile
//                   ? URL.createObjectURL(imageFile)
//                   : item.product_image,
//                 product_image_2: imageFile2
//                   ? URL.createObjectURL(imageFile2)
//                   : item.product_image_2 || null,
//                 product_image_3: imageFile3
//                   ? URL.createObjectURL(imageFile3)
//                   : item.product_image_3 || null,
//                 product_image_4: imageFile4
//                   ? URL.createObjectURL(imageFile4)
//                   : item.product_image_4 || null,
//               }
//               : item
//           )
//         );
//         closeEditForm();
//         await fetchList(currentPage);
//       } else {
//         toast.error(response.data.message || 'فشل في تحديث المنتج');
//       }
//     } catch (error) {
//       if (error.code === 'ERR_NETWORK') {
//         toast.error('غير قادر على الاتصال بالخادم. لم يتم حفظ التغييرات.');
//       } else if (error.response) {
//         const errorMessage = error.response.data.message || 'خطأ في التحقق من البيانات';
//         toast.error(`خطأ في الخادم: ${error.response.status} - ${errorMessage}`);
//         if (error.response.data.errors) {
//           Object.values(error.response.data.errors).forEach((err) => {
//             toast.error(err);
//           });
//         }
//       } else {
//         toast.error(error.message || 'حدث خطأ أثناء تحديث المنتج');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // دالة التعامل مع تغيير الصفحة
//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//       fetchList(newPage);
//     }
//   };

//   // جلب المنتجات والفئات عند تحميل المكون أو تغيير الصفحة
//   useEffect(() => {
//     if (token && !isLoading) {
//       fetchList(currentPage);
//       fetchCategories();
//     } else if (!token) {
//       toast.error('يرجى تسجيل الدخول لعرض المنتجات');
//       setList([]);
//     }
//   }, [token, currentPage]);

//   return (
//     <>
//       <div className="min-h-screen flex flex-col">
//         <p className="mb-2">قائمة جميع المنتجات</p>
//         {isLoading && <p>جارٍ تحميل المنتجات...</p>}
//         {list.length === 0 && !isLoading && <p>لا توجد منتجات متاحة.</p>}
//         {list.length > 0 && (
//           <div className="flex-grow flex flex-col gap-2">
//             <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
//               <b>الصورة</b>
//               <b>الاسم</b>
//               <b>الفئة</b>
//               <b>السعر</b>
//               <b className="text-center">حذف</b>
//               <b className="text-center">تعديل</b>
//             </div>
//             {list.map((item) => (
//               <div
//                 key={item.product_id}
//                 className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
//               >
//                 <div className="flex gap-2">
//                   <img
//                     className="w-12"
//                     src={item.product_image || 'placeholder-image-url'}
//                     alt={item.product_name || 'المنتج'}
//                   />
//                   {item.product_image_2 && (
//                     <img
//                       className="w-12"
//                       src={item.product_image_2}
//                       alt={`${item.product_name} - صورة 2`}
//                     />
//                   )}
//                   {item.product_image_3 && (
//                     <img
//                       className="w-12"
//                       src={item.product_image_3}
//                       alt={`${item.product_name} - صورة 3`}
//                     />
//                   )}
//                   {item.product_image_4 && (
//                     <img
//                       className="w-12"
//                       src={item.product_image_4}
//                       alt={`${item.product_name} - صورة 4`}
//                     />
//                   )}
//                 </div>
//                 <p>{item.product_name || 'غير متوفر'}</p>
//                 <p>{item.category?.category_name || 'غير متوفر'}</p>
//                 <p>
//                   {currency}
//                   {item.product_price || '0.00'}
//                 </p>
//                 <p
//                   onClick={() => confirmDeleteProduct(item)}
//                   className="text-center cursor-pointer text-lg"
//                 >
//                   X
//                 </p>
//                 <p
//                   onClick={() => openEditForm(item)}
//                   className="text-center cursor-pointer text-lg"
//                 >
//                   ✏️
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* نافذة تأكيد الحذف */}
//         <Modal
//           isOpen={isDeleteModalOpen}
//           onRequestClose={closeDeleteModal}
//           className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-40"
//           overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
//         >
//           <h2 className="text-lg font-bold mb-4">تأكيد الحذف</h2>
//           <div className="flex flex-col items-center mb-4">
//             {productToDelete && (
//               <div className="flex gap-2">
//                 <img
//                   className="w-16 h-16 mb-2 object-cover"
//                   src={productToDelete.product_image || 'placeholder-image-url'}
//                   alt={productToDelete.product_name || 'المنتج'}
//                 />
//                 {productToDelete.product_image_2 && (
//                   <img
//                     className="w-16 h-16 mb-2 object-cover"
//                     src={productToDelete.product_image_2}
//                     alt={`${productToDelete.product_name} - صورة 2`}
//                   />
//                 )}
//                 {productToDelete.product_image_3 && (
//                   <img
//                     className="w-16 h-16 mb-2 object-cover"
//                     src={productToDelete.product_image_3}
//                     alt={`${productToDelete.product_name} - صورة 3`}
//                   />
//                 )}
//                 {productToDelete.product_image_4 && (
//                   <img
//                     className="w-16 h-16 mb-2 object-cover"
//                     src={productToDelete.product_image_4}
//                     alt={`${productToDelete.product_name} - صورة 4`}
//                   />
//                 )}
//               </div>
//             )}
//             <p>
//               هل أنت متأكد من حذف المنتج{' '}
//               <span className="font-semibold">{productToDelete?.product_name || 'غير معروف'}</span>؟
//             </p>
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               onClick={removeProduct}
//               className="bg-red-500 text-white rounded px-4 py-2 disabled:bg-gray-400"
//               disabled={isLoading}
//             >
//               {isLoading ? 'جارٍ الحذف...' : 'نعم، احذف'}
//             </button>
//             <button
//               onClick={closeDeleteModal}
//               className="bg-gray-500 text-white rounded px-4 py-2"
//             >
//               إلغاء
//             </button>
//           </div>
//         </Modal>

//         {/* نافذة منبثقة لتعديل المنتج */}
//         <Modal
//           isOpen={isModalOpen}
//           onRequestClose={closeEditForm}
//           className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-20"
//           overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
//         >
//           <h2 className="text-xl font-bold mb-4">تعديل المنتج</h2>
//           {editItem && (
//             <div className="bg-gray-50 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-20">
//               <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">تعديل المنتج</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">اسم المنتج:</label>
//                   <input
//                     type="text"
//                     name="product_name"
//                     value={editFormData.product_name}
//                     onChange={handleEditFormChange}
//                     className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-300"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">الوصف:</label>
//                   <input
//                     type="text"
//                     name="product_description"
//                     value={editFormData.product_description}
//                     onChange={handleEditFormChange}
//                     className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-300"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">السعر:</label>
//                   <input
//                     type="number"
//                     name="product_price"
//                     value={editFormData.product_price}
//                     onChange={handleEditFormChange}
//                     className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-300"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">الكمية:</label>
//                   <input
//                     type="number"
//                     name="product_quantity"
//                     value={editFormData.product_quantity}
//                     onChange={handleEditFormChange}
//                     className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-300"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">الفئة:</label>
//                   <select
//                     name="category_id"
//                     value={editFormData.category_id}
//                     onChange={handleEditFormChange}
//                     className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-300"
//                     required
//                   >
//                     <option value="">اختر فئة</option>
//                     {categories.map((category) => (
//                       <option key={category.id} value={category.id}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium mb-1">معرف المنتج:</label>
//                   <input
//                     type="text"
//                     name="product_id"
//                     value={editFormData.product_id}
//                     className="border rounded px-3 py-2 w-full bg-gray-100 cursor-not-allowed"
//                     disabled
//                   />
//                 </div>
//               </div>

//               {/* صور المنتج */}
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {[
//                   { label: "الصورة الرئيسية", file: imageFile, name: 'image' },
//                   { label: "الصورة الإضافية 1", file: imageFile2, name: 'image_2' },
//                   { label: "الصورة الإضافية 2", file: imageFile3, name: 'image_3' },
//                   { label: "الصورة الإضافية 3", file: imageFile4, name: 'image_4' },
//                 ].map((img, index) => (
//                   <div key={index}>
//                     <label className="block text-sm font-medium mb-1">{img.label} (PNG، JPG، JPEG):</label>
//                     <input
//                       type="file"
//                       accept="image/png, image/jpeg, image/jpg"
//                       onChange={(e) => handleImageChange(e, img.name)}
//                       className="border rounded px-2 py-1 w-full"
//                     />
//                     {/* معاينة مباشرة */}
//                     {img.file && (
//                       <div className="mt-2">
//                         <img
//                           src={URL.createObjectURL(img.file)}
//                           alt={img.label}
//                           className="w-24 h-24 object-cover rounded border"
//                         />
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {/* أزرار الحفظ */}
//               <div className="flex justify-end gap-3 mt-8">
//                 <button
//                   onClick={updateProduct}
//                   className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded px-6 py-2 shadow disabled:bg-gray-400"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? 'جارٍ الحفظ...' : '💾 حفظ التعديلات'}
//                 </button>
//                 <button
//                   onClick={closeEditForm}
//                   className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded px-6 py-2 shadow"
//                 >
//                   إلغاء
//                 </button>
//               </div>
//             </div>

//           )}
//         </Modal>

//         {/* أزرار التنقل بين الصفحات */}
//         <div className="absolute top-[76%] left-1/2 -translate-x1/2 -translate-y-1/2 flex gap-4">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//           >
//             السابق
//           </button>
//           <span className="px-4 py-2">الصفحة {currentPage} من {totalPages}</span>
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//           >
//             التالي
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default List;
