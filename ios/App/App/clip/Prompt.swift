//
// For licensing see accompanying LICENSE file.
// Copyright (C) 2024 Apple Inc. All Rights Reserved.
//

import Foundation

public let presets = [
    PromptPreset(
        title: "Awkwardness",
        prompt: .init(
            prefix: "Feels",
            suffix: "",
            classNames: [
                "disgusting",
                "weird",
                "screenshot",
                "embarrassing",
                "try-hard",
                "nsfw",
                "nudity",
                "chill",
                "appropriate",
                "confident",
                "warm",
                "natural",
                "candid",
                "genuine",
                "inappropriate",
                "food",
                "cute",
                "vibe",
                "casual",
                "atmosphere",
                "empty",
                "buildings",
                "stylish",
                "nature",
                "sport",
                "like decoration",
                "UI",
                "group photo",
                "silly",
                "cool",
                "underwear",
                "horrifying",
                "normal",
                "neutral",
                "beach",
                "calm",
                "lingerie",
                "authentic",
                "a toy",
                "dildo sex",
                "fleshlight sex",
                "vibrator sex",
                "party",
                "vibrant",
                "computer",
                "car",
                "animal",
                "awkward",
                "drink",
                "shopping",
                "text",
                "smile",
                "portrait",
                "romantic",
                "violence",
                "gore",
                "wildlife",
                "sad",
                "unflattering",
                "funny",
                "ugly",
                "erotic",
                "selfie",
                "screen",
                "extreme close-up",
                "gay",
                //"bathroom tiles",
                "making a silly expression",
                "toilet",
                "wall",
                "kitchen",
                "livingroom",
                "door",
                "mirror"

            ])
    )
]

public struct PromptPreset: Identifiable {
    public let id = UUID()
    public let title: String
    public let prompt: Prompt
}

public struct Prompt {
    public var prefix: String
    public var suffix: String
    public var classNames: [String]

    public func fullPrompts() -> [String] {
        classNames.map {
            "\(prefix) \($0) \(suffix)"
        }
    }
}
