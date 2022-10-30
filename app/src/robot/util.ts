export const formatParam = (param: number | null | undefined) => {
    return param?.toFixed(2) ?? "--";
};