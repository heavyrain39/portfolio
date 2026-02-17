import React from "react";
import { motion, type MotionValue } from "framer-motion";

type MiniGameCrosshairProps = {
    x: MotionValue<number>;
    y: MotionValue<number>;
    isOverheated: boolean;
    isShooting: boolean;
};

export default function MiniGameCrosshair({
    x,
    y,
    isOverheated,
    isShooting
}: MiniGameCrosshairProps) {
    return (
        <motion.div
            className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference"
            style={{
                x,
                y,
                top: 0,
                left: 0,
                position: "absolute"
            }}
        >
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-current rounded-full opacity-80"
                animate={isOverheated ? { scale: 1, opacity: 1 } : { scale: isShooting ? 0.8 : 1.2, opacity: isShooting ? 1 : 0.5 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
            />
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-500 rounded-full"
                animate={{ scale: isOverheated ? 0 : 1, opacity: isOverheated ? 0 : 1 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
            />

            <motion.div
                className="absolute inset-0"
                animate={isOverheated ? { opacity: 0, scale: 0.4 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.13, ease: "easeOut" }}
            >
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-2 bg-current"
                    animate={{ y: isShooting ? 3 : -16 }}
                />
                <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[1px] h-2 bg-current"
                    animate={{ y: isShooting ? -3 : 16 }}
                />
                <motion.div
                    className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-[1px] bg-current"
                    animate={{ x: isShooting ? 3 : -16 }}
                />
                <motion.div
                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-[1px] bg-current"
                    animate={{ x: isShooting ? -3 : 16 }}
                />
            </motion.div>

            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={isOverheated ? { opacity: 1, scale: 1, rotate: 45 } : { opacity: 0, scale: 0.4, rotate: 0 }}
                transition={{ duration: 0.13, ease: "easeOut" }}
            >
                <div className="absolute w-full h-[1px] bg-current" />
                <div className="absolute w-full h-[1px] bg-current rotate-90" />
            </motion.div>
        </motion.div>
    );
}
