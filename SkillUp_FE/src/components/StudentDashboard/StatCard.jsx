import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

const StatCard = memo(({ icon, label, value, color }) => {
    const IconComponent = icon;
    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">{label}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${color}`}>
                        <IconComponent className="w-6 h-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

StatCard.displayName = "StatCard";

export default StatCard;

