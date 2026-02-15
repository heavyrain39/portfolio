"use client";

import React from "react";
import { addPropertyControls, ControlType } from "framer";
import MiniGame from "./components/MiniGame";
import { DEFAULT_DIALOGUES, type SidearmProps } from "./types";

export default function Sidearm(props: SidearmProps) {
    return (
        <MiniGame
            themeColor={props.themeColor ?? "#06b6d4"}
            accentColor={props.accentColor ?? "#ffffff"}
            showOperator={props.showOperator ?? true}
            showOperatorImage={props.showOperatorImage ?? true}
            showOperatorComments={props.showOperatorComments ?? true}
            dialogueList={props.dialogueList ?? DEFAULT_DIALOGUES}
            operatorAssetBasePath={props.operatorAssetBasePath ?? "./assets/operator"}
            operatorId={props.operatorId}
            enableSound={props.enableSound ?? true}
            initialMuted={props.initialMuted ?? false}
            volume={props.volume ?? 70}
            projectileSpeed={props.projectileSpeed ?? 45}
            spray={props.spray ?? 0.12}
            hitParticleMultiplier={props.hitParticleMultiplier ?? 1}
            killParticleMultiplier={props.killParticleMultiplier ?? 1}
            showHud={props.showHud ?? true}
            isEditorMode={props.isEditorMode ?? false}
            className={props.className}
            style={props.style}
        />
    );
}

addPropertyControls(Sidearm, {
    themeColor: {
        type: ControlType.Color,
        title: "Theme",
        defaultValue: "#06b6d4"
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#ffffff"
    },
    showOperator: {
        type: ControlType.Boolean,
        title: "Operator",
        defaultValue: true
    },
    showOperatorImage: {
        type: ControlType.Boolean,
        title: "Op Image",
        defaultValue: true,
        hidden: (props: SidearmProps) => !props.showOperator
    },
    showOperatorComments: {
        type: ControlType.Boolean,
        title: "Op Text",
        defaultValue: true,
        hidden: (props: SidearmProps) => !props.showOperator
    },
    operatorId: {
        type: ControlType.Enum,
        title: "Operator ID",
        options: ["operator01", "operator02", "operator03", "operator04"],
        optionTitles: ["Op 01", "Op 02", "Op 03", "Op 04"],
        hidden: (props: SidearmProps) => !props.showOperator || !props.showOperatorImage
    },
    dialogueList: {
        type: ControlType.Array,
        title: "Dialogues",
        propertyControl: {
            type: ControlType.String
        },
        defaultValue: DEFAULT_DIALOGUES,
        hidden: (props: SidearmProps) => !props.showOperator || !props.showOperatorComments
    },
    operatorAssetBasePath: {
        type: ControlType.String,
        title: "Asset Path",
        defaultValue: "./assets/operator",
        hidden: (props: SidearmProps) => !props.showOperator || !props.showOperatorImage
    },
    enableSound: {
        type: ControlType.Boolean,
        title: "Sound",
        defaultValue: true
    },
    volume: {
        type: ControlType.Number,
        title: "Volume",
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        defaultValue: 70,
        hidden: (props: SidearmProps) => !props.enableSound
    },
    initialMuted: {
        type: ControlType.Boolean,
        title: "Start Muted",
        defaultValue: false,
        hidden: (props: SidearmProps) => !props.enableSound
    },
    projectileSpeed: {
        type: ControlType.Number,
        title: "Bullet Speed",
        min: 20,
        max: 120,
        step: 1,
        defaultValue: 45
    },
    spray: {
        type: ControlType.Number,
        title: "Spray",
        min: 0,
        max: 0.7,
        step: 0.01,
        defaultValue: 0.12
    },
    hitParticleMultiplier: {
        type: ControlType.Number,
        title: "Hit FX",
        min: 0.2,
        max: 4,
        step: 0.1,
        defaultValue: 1
    },
    killParticleMultiplier: {
        type: ControlType.Number,
        title: "Kill FX",
        min: 0.2,
        max: 4,
        step: 0.1,
        defaultValue: 1
    },
    showHud: {
        type: ControlType.Boolean,
        title: "HUD",
        defaultValue: true
    },
    isEditorMode: {
        type: ControlType.Boolean,
        title: "Editor 30fps",
        defaultValue: false
    }
});
