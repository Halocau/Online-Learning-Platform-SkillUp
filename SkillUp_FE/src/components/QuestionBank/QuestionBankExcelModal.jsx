import { Modal, Button, Upload, message, Popconfirm } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const QuestionBankExcelModal = ({ open, onClose, onImport }) => {

    const handleDownloadTemplate = () => {
        const link = document.createElement("a");
        link.href = "/quiz_questions_template.xlsx";
        link.download = "quiz_questions_template.xlsx";
        link.click();
    };

    const beforeUpload = (file) => {
        const isExcel =
            file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.type === "application/vnd.ms-excel";

        if (!isExcel) {
            toast.error("Chỉ được phép nhập file Excel (.xlsx / .xls)");
            return Upload.LIST_IGNORE;
        }

        onImport(file);
        return false; // stop auto-upload
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title="Nhập câu hỏi từ Excel"
        >
            <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-gray-700">
                    Tạo câu hỏi bằng file mẫu:
                </p>
                <Popconfirm
                    title="Bạn có chắc muốn tải file mẫu không?"
                    okText="Tải xuống"
                    cancelText="Hủy"
                    onConfirm={handleDownloadTemplate}
                >
                    <Button type="primary" icon={<DownloadOutlined />}>
                        Tải file mẫu (quiz_questions_template.xlsx)
                    </Button>
                </Popconfirm>

                <div className="flex items-center my-1">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm">hoặc</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <p className="text-sm font-medium text-gray-700">
                    Nhập câu hỏi từ file Excel đã có:
                </p>
                <Upload beforeUpload={beforeUpload} showUploadList={false}>
                    <Button icon={<UploadOutlined />} style={{ width: 472 }}>
                        Chọn file Excel để nhập
                    </Button>
                </Upload>

                <p className="text-sm text-gray-500 pt-2">
                    <b>Lưu ý:</b> Các câu hỏi sẽ được thêm vào chương hiện tại.
                </p>

            </div>
        </Modal>
    );
};

export default QuestionBankExcelModal;
