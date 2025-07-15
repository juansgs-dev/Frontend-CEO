import { useEffect, useState } from "react";
import axiosInstance from "../../../services/api/axiosConfig";
import { getUserId } from "../../../utils/timeManagement/operationTime";

const useProductInventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [createdByUsed, setCreatedByUsed] = useState(null);

    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            setError(null);

            try {
                const realUserId = getUserId();

                let teacherProducts = [];
                let teacherId = null;

                try {
                    const teacherRes = await axiosInstance.get("/groupstudents/get-teacher-id", {
                        params: { student_id: realUserId },
                    });
                    teacherId = teacherRes.data?.teacher_id;

                    if (teacherId) {
                        const teacherInventoryRes = await axiosInstance.get("productsInventory/getProductInventoryByCreatedBy", {
                            params: { created_by: teacherId },
                        });
                        teacherProducts = teacherInventoryRes.data.inventories || [];
                    }
                } catch (err) {
                    if (err.response?.status !== 404) {
                        throw err;
                    }
                    console.warn("No se encontró docente, pero puede no ser fatal.");
                }

                const studentRes = await axiosInstance.get("productsInventory/getProductInventoryByCreatedBy", {
                    params: { created_by: realUserId },
                });
                const studentProducts = studentRes.data.inventories || [];

                if (studentProducts.length > 0) {
                    setProducts(formatProducts(studentProducts, teacherProducts));
                    setCreatedByUsed(realUserId);
                } else if (teacherProducts.length > 0) {

                    setProducts(formatProducts(teacherProducts, teacherProducts));
                    setCreatedByUsed(teacherId);
                } else {
                    setError("Ni tú ni tu docente tienen productos registrados.");
                    setProducts([]);
                }
            } catch (err) {
                console.error("Error inesperado:", err.message);
                setError("Error al cargar el inventario.");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);


    const formatProducts = (inventory, teacherInventory) => {
        return inventory.map((item) => {
            const teacherProduct = teacherInventory.find(t => t.product_id === item.product_id);
            const suggestedMin = teacherProduct ? teacherProduct.unit_cost * 0.9 : item.unit_cost * 0.9;
            const suggestedMax = teacherProduct ? teacherProduct.unit_cost * 1.2 : item.unit_cost * 1.2;

            return {
                id: item.product_id,
                name: item.Product?.name || "Sin nombre",
                unit_cost: item.unit_cost,
                credit30: item.credit30,
                credit60: item.credit60,
                investment_percent: item.investment_percent,
                quantity: item.quantity,
                suggestedMin,
                suggestedMax,
                currentPrice: item.unit_cost,
            };
        });
    };

    return { products, loading, error };
};

export default useProductInventory;
