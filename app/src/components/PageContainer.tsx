import { PropsWithChildren } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

const PageContainer = (props: PropsWithChildren) => {
    const theme = useTheme();

    return (
        <View style={{
            backgroundColor: theme.colors.background,
            flex: 1
        }}>
            {props.children}
        </View>
    );
};

export default PageContainer