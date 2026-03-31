import React, { forwardRef, useRef, useState } from 'react';
import { PanResponder, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SignaturePadProps {
    onSave: (pathData: string) => void;
    height?: number;
}

const SignaturePad = forwardRef<View, SignaturePadProps>(function SignaturePad({ onSave, height = 160 }, ref) {
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState('');
    // Track paths in a ref so PanResponder callbacks avoid stale closures
    // and onSave is never called inside a setPaths callback (fixes setState-in-render warning)
    const pathsRef = useRef<string[]>([]);
    const isDrawing = useRef(false);

    const buildPath = (x: number, y: number, move: boolean) => {
        if (move) return `M${x.toFixed(1)},${y.toFixed(1)}`;
        return ` L${x.toFixed(1)},${y.toFixed(1)}`;
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (evt) => {
            isDrawing.current = true;
            const { locationX, locationY } = evt.nativeEvent;
            setCurrentPath(buildPath(locationX, locationY, true));
        },

        onPanResponderMove: (evt) => {
            if (!isDrawing.current) return;
            const { locationX, locationY } = evt.nativeEvent;
            setCurrentPath(prev => prev + buildPath(locationX, locationY, false));
        },

        onPanResponderRelease: () => {
            isDrawing.current = false;
            if (currentPath) {
                pathsRef.current = [...pathsRef.current, currentPath];
                setPaths([...pathsRef.current]);
                onSave(pathsRef.current.join(' '));
                setCurrentPath('');
            }
        },

        onPanResponderTerminate: () => {
            isDrawing.current = false;
            setCurrentPath('');
        },
    });

    const clear = () => {
        pathsRef.current = [];
        setPaths([]);
        setCurrentPath('');
        onSave('');
    };

    const isEmpty = paths.length === 0 && !currentPath;

    return (
        <View>
            <View
                ref={ref}
                style={{ height, borderRadius: 10, overflow: 'hidden' }}
                className="bg-slate-50 border border-slate-200"
                {...panResponder.panHandlers}>
                <Svg width="100%" height={height}>
                    {paths.map((d, i) => (
                        <Path
                            key={i}
                            d={d}
                            stroke="#1e4b69"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    ))}
                    {currentPath ? (
                        <Path
                            d={currentPath}
                            stroke="#1e4b69"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    ) : null}
                </Svg>

                {isEmpty && (
                    <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12 }} className="text-slate-400">
                            Sign here
                        </Text>
                    </View>
                )}
            </View>

            <View className="flex-row justify-between items-center mt-2">
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">
                    {isEmpty ? 'Draw your signature above' : 'Signed ✓'}
                </Text>
                {!isEmpty && (
                    <TouchableOpacity onPress={clear}>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12 }} className="text-brand-orange">
                            Clear
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
});

export default SignaturePad;
