import { writeFileSync } from "fs"
import { resolve } from "path"
import { serializeToRbxmx } from "../lib/studio/rbxmx-serializer"
import { parseLuauToTrees } from "../lib/studio/luau-to-tree"
import type { SerializedInstance } from "../lib/studio/types"

// Test 1: Stud-styled shop UI built as SerializedInstance tree
const studShop: SerializedInstance = {
  className: "ScreenGui",
  name: "ShopUI",
  properties: {
    ZIndexBehavior: "Sibling",
    ResetOnSpawn: false,
    IgnoreGuiInset: true,
  },
  children: [
    {
      className: "Frame",
      name: "MainPanel",
      properties: {
        Size: { XScale: 0.38, XOffset: 0, YScale: 0.6, YOffset: 0 },
        Position: { XScale: 0.5, XOffset: 0, YScale: 0.491, YOffset: 0 },
        AnchorPoint: { X: 0.5, Y: 0.5 },
        BackgroundColor3: { R: 0, G: 0, B: 0 },
        BackgroundTransparency: 0.55,
        ClipsDescendants: true,
      },
      children: [
        {
          className: "UIAspectRatioConstraint",
          name: "UIAspectRatioConstraint",
          properties: { AspectRatio: 1.4627, AspectType: "ScaleWithParentSize", DominantAxis: "Height" },
          children: [],
        },
        {
          className: "UIStroke",
          name: "UIStroke",
          properties: { Thickness: 3, Color: { R: 0, G: 0, B: 0 }, ApplyStrokeMode: "Border" },
          children: [],
        },
        {
          className: "ImageLabel",
          name: "StudBackground",
          properties: {
            Size: { XScale: 1, XOffset: 0, YScale: 1, YOffset: 0 },
            BackgroundTransparency: 1,
            Image: "rbxassetid://15910695828",
            ImageTransparency: 0.7,
            ScaleType: "Tile",
            ZIndex: 0,
          },
          children: [],
        },
        {
          className: "CanvasGroup",
          name: "InsiderFrame",
          properties: {
            Size: { XScale: 0.979, XOffset: 0, YScale: 0.968, YOffset: 0 },
            Position: { XScale: 0.5, XOffset: 0, YScale: 0.5, YOffset: 0 },
            AnchorPoint: { X: 0.5, Y: 0.5 },
            BackgroundTransparency: 1,
            ClipsDescendants: true,
          },
          children: [
            // Header banner
            {
              className: "ImageLabel",
              name: "Header",
              properties: {
                Size: { XScale: 1.009, XOffset: 0, YScale: 0.207, YOffset: 0 },
                Position: { XScale: -0.006, XOffset: 0, YScale: -0.027, YOffset: 0 },
                BackgroundTransparency: 1,
                Image: "rbxassetid://139872784959993",
              },
              children: [
                {
                  className: "UIAspectRatioConstraint",
                  name: "UIAspectRatioConstraint",
                  properties: { AspectRatio: 7.1134, AspectType: "FitWithinMaxSize", DominantAxis: "Width" },
                  children: [],
                },
                {
                  className: "ImageLabel",
                  name: "Icon",
                  properties: {
                    Size: { XScale: 0.097, XOffset: 0, YScale: 0.763, YOffset: 0 },
                    Position: { XScale: 0.012, XOffset: 0, YScale: 0.111, YOffset: 0 },
                    BackgroundTransparency: 1,
                    Image: "rbxassetid://99092746223643",
                  },
                  children: [],
                },
                {
                  className: "TextLabel",
                  name: "Title",
                  properties: {
                    Size: { XScale: 0.311, XOffset: 0, YScale: 0.553, YOffset: 0 },
                    Position: { XScale: 0.12, XOffset: 0, YScale: 0.199, YOffset: 0 },
                    BackgroundTransparency: 1,
                    Text: "SHOP",
                    TextColor3: { R: 1, G: 1, B: 1 },
                    Font: "FredokaOne",
                    TextScaled: true,
                  },
                  children: [
                    {
                      className: "UIStroke",
                      name: "UIStroke",
                      properties: { Thickness: 3, Color: { R: 0, G: 0, B: 0 } },
                      children: [],
                    },
                  ],
                },
                {
                  className: "ImageButton",
                  name: "CloseButton",
                  properties: {
                    Size: { XScale: 0.115, XOffset: 0, YScale: 0.829, YOffset: 0 },
                    Position: { XScale: 0.879, XOffset: 0, YScale: 0.077, YOffset: 0 },
                    BackgroundTransparency: 1,
                    Image: "rbxassetid://124332107873691",
                  },
                  children: [],
                },
              ],
            },
            // Scrolling content
            {
              className: "ScrollingFrame",
              name: "ContentScroll",
              properties: {
                Size: { XScale: 1, XOffset: 0, YScale: 0.83, YOffset: 0 },
                Position: { XScale: 0, XOffset: 0, YScale: 0.163, YOffset: 0 },
                BackgroundTransparency: 1,
                CanvasSize: { XScale: 0, XOffset: 0, YScale: 3, YOffset: 0 },
                ScrollBarThickness: 4,
                ScrollBarImageColor3: { R: 0.3, G: 0.3, B: 0.3 },
              },
              children: [
                {
                  className: "UIAspectRatioConstraint",
                  name: "UIAspectRatioConstraint",
                  properties: { AspectRatio: 1.7829, AspectType: "FitWithinMaxSize", DominantAxis: "Width" },
                  children: [],
                },
                {
                  className: "UIListLayout",
                  name: "UIListLayout",
                  properties: {
                    FillDirection: "Vertical",
                    HorizontalAlignment: "Center",
                    SortOrder: "LayoutOrder",
                    Padding: { Scale: 0.01, Offset: 0 },
                  },
                  children: [],
                },
                {
                  className: "UIPadding",
                  name: "UIPadding",
                  properties: {
                    PaddingLeft: { Scale: 0.02, Offset: 0 },
                    PaddingRight: { Scale: 0.02, Offset: 0 },
                    PaddingTop: { Scale: 0.01, Offset: 0 },
                  },
                  children: [],
                },
                // Gamepasses section title
                {
                  className: "TextLabel",
                  name: "GamepassesTitle",
                  properties: {
                    Size: { XScale: 0.334, XOffset: 0, YScale: 0.023, YOffset: 0 },
                    BackgroundTransparency: 1,
                    Text: "GAMEPASSES",
                    TextColor3: { R: 1, G: 1, B: 1 },
                    Font: "FredokaOne",
                    TextScaled: true,
                    TextXAlignment: "Left",
                    LayoutOrder: 0,
                  },
                  children: [
                    {
                      className: "UIStroke",
                      name: "UIStroke",
                      properties: { Thickness: 2, Color: { R: 0, G: 0, B: 0 } },
                      children: [],
                    },
                  ],
                },
                // Gamepasses holder with manual card positioning
                {
                  className: "Frame",
                  name: "GamepassHolder",
                  properties: {
                    Size: { XScale: 0.995, XOffset: 0, YScale: 0.18, YOffset: 0 },
                    BackgroundTransparency: 1,
                    LayoutOrder: 1,
                  },
                  children: [
                    // Top-left card: VIP
                    {
                      className: "ImageLabel",
                      name: "VIPCard",
                      properties: {
                        Size: { XScale: 0.49, XOffset: 0, YScale: 0.49, YOffset: 0 },
                        Position: { XScale: 0, XOffset: 0, YScale: 0, YOffset: 0 },
                        BackgroundTransparency: 1,
                        Image: "rbxassetid://76309595287087",
                        ClipsDescendants: true,
                      },
                      children: [
                        {
                          className: "TextLabel",
                          name: "Title",
                          properties: {
                            Size: { XScale: 0.728, XOffset: 0, YScale: 0.236, YOffset: 0 },
                            Position: { XScale: 0.144, XOffset: 0, YScale: 0.075, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Text: "VIP",
                            TextColor3: { R: 1, G: 1, B: 1 },
                            Font: "FredokaOne",
                            TextScaled: true,
                          },
                          children: [
                            { className: "UIStroke", name: "UIStroke", properties: { Thickness: 2, Color: { R: 0, G: 0, B: 0 } }, children: [] },
                          ],
                        },
                        {
                          className: "TextLabel",
                          name: "Description",
                          properties: {
                            Size: { XScale: 0.417, XOffset: 0, YScale: 0.306, YOffset: 0 },
                            Position: { XScale: 0.492, XOffset: 0, YScale: 0.346, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Text: "2x cash & exclusive perks",
                            TextColor3: { R: 0.184, G: 1, B: 0.62 },
                            Font: "FredokaOne",
                            TextScaled: true,
                          },
                          children: [
                            { className: "UIStroke", name: "UIStroke", properties: { Thickness: 1.4, Color: { R: 0, G: 0, B: 0 } }, children: [] },
                          ],
                        },
                        {
                          className: "ImageLabel",
                          name: "Icon",
                          properties: {
                            Size: { XScale: 0.249, XOffset: 0, YScale: 0.914, YOffset: 0 },
                            Position: { XScale: 0.095, XOffset: 0, YScale: 0.019, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Image: "rbxassetid://117997645720141",
                            ScaleType: "Fit",
                          },
                          children: [],
                        },
                        {
                          className: "ImageButton",
                          name: "PurchaseButton",
                          properties: {
                            Size: { XScale: 0.368, XOffset: 0, YScale: 0.229, YOffset: 0 },
                            Position: { XScale: 0.330, XOffset: 0, YScale: 0.662, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Image: "rbxassetid://121960215707315",
                            ScaleType: "Fit",
                          },
                          children: [
                            {
                              className: "ImageLabel",
                              name: "RobuxIcon",
                              properties: {
                                Size: { XScale: 0.298, XOffset: 0, YScale: 0.781, YOffset: 0 },
                                Position: { XScale: 0.137, XOffset: 0, YScale: 0.06, YOffset: 0 },
                                BackgroundTransparency: 1,
                                Image: "rbxassetid://80308670743296",
                              },
                              children: [],
                            },
                            {
                              className: "TextLabel",
                              name: "Price",
                              properties: {
                                Size: { XScale: 0.525, XOffset: 0, YScale: 0.856, YOffset: 0 },
                                Position: { XScale: 0.296, XOffset: 0, YScale: 0.032, YOffset: 0 },
                                BackgroundTransparency: 1,
                                Text: "199",
                                TextColor3: { R: 1, G: 1, B: 1 },
                                Font: "Bangers",
                                TextScaled: true,
                              },
                              children: [
                                { className: "UIStroke", name: "UIStroke", properties: { Thickness: 2.1, Color: { R: 0, G: 0, B: 0 } }, children: [] },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    // Top-right card: 2x Money
                    {
                      className: "ImageLabel",
                      name: "DoubleMoneyCard",
                      properties: {
                        Size: { XScale: 0.49, XOffset: 0, YScale: 0.49, YOffset: 0 },
                        Position: { XScale: 0.5, XOffset: 0, YScale: 0, YOffset: 0 },
                        BackgroundTransparency: 1,
                        Image: "rbxassetid://89247314503392",
                        ClipsDescendants: true,
                      },
                      children: [
                        {
                          className: "TextLabel",
                          name: "Title",
                          properties: {
                            Size: { XScale: 0.728, XOffset: 0, YScale: 0.236, YOffset: 0 },
                            Position: { XScale: 0.144, XOffset: 0, YScale: 0.075, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Text: "2X MONEY",
                            TextColor3: { R: 1, G: 1, B: 1 },
                            Font: "FredokaOne",
                            TextScaled: true,
                          },
                          children: [
                            { className: "UIStroke", name: "UIStroke", properties: { Thickness: 2, Color: { R: 0, G: 0, B: 0 } }, children: [] },
                          ],
                        },
                        {
                          className: "ImageLabel",
                          name: "Icon",
                          properties: {
                            Size: { XScale: 0.249, XOffset: 0, YScale: 0.914, YOffset: 0 },
                            Position: { XScale: 0.095, XOffset: 0, YScale: 0.019, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Image: "rbxassetid://116714324726733",
                            ScaleType: "Fit",
                          },
                          children: [],
                        },
                        {
                          className: "ImageButton",
                          name: "PurchaseButton",
                          properties: {
                            Size: { XScale: 0.368, XOffset: 0, YScale: 0.229, YOffset: 0 },
                            Position: { XScale: 0.330, XOffset: 0, YScale: 0.662, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Image: "rbxassetid://121960215707315",
                            ScaleType: "Fit",
                          },
                          children: [
                            {
                              className: "ImageLabel",
                              name: "RobuxIcon",
                              properties: {
                                Size: { XScale: 0.298, XOffset: 0, YScale: 0.781, YOffset: 0 },
                                Position: { XScale: 0.137, XOffset: 0, YScale: 0.06, YOffset: 0 },
                                BackgroundTransparency: 1,
                                Image: "rbxassetid://80308670743296",
                              },
                              children: [],
                            },
                            {
                              className: "TextLabel",
                              name: "Price",
                              properties: {
                                Size: { XScale: 0.525, XOffset: 0, YScale: 0.856, YOffset: 0 },
                                Position: { XScale: 0.296, XOffset: 0, YScale: 0.032, YOffset: 0 },
                                BackgroundTransparency: 1,
                                Text: "149",
                                TextColor3: { R: 1, G: 1, B: 1 },
                                Font: "Bangers",
                                TextScaled: true,
                              },
                              children: [
                                { className: "UIStroke", name: "UIStroke", properties: { Thickness: 2.1, Color: { R: 0, G: 0, B: 0 } }, children: [] },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    // Bottom-left card: Speed Coil
                    {
                      className: "ImageLabel",
                      name: "SpeedCoilCard",
                      properties: {
                        Size: { XScale: 0.49, XOffset: 0, YScale: 0.49, YOffset: 0 },
                        Position: { XScale: 0, XOffset: 0, YScale: 0.5, YOffset: 0 },
                        BackgroundTransparency: 1,
                        Image: "rbxassetid://116663362953939",
                        ClipsDescendants: true,
                      },
                      children: [
                        {
                          className: "TextLabel",
                          name: "Title",
                          properties: {
                            Size: { XScale: 0.728, XOffset: 0, YScale: 0.236, YOffset: 0 },
                            Position: { XScale: 0.144, XOffset: 0, YScale: 0.075, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Text: "SPEED COIL",
                            TextColor3: { R: 1, G: 1, B: 1 },
                            Font: "FredokaOne",
                            TextScaled: true,
                          },
                          children: [
                            { className: "UIStroke", name: "UIStroke", properties: { Thickness: 2, Color: { R: 0, G: 0, B: 0 } }, children: [] },
                          ],
                        },
                        {
                          className: "ImageLabel",
                          name: "Icon",
                          properties: {
                            Size: { XScale: 0.249, XOffset: 0, YScale: 0.914, YOffset: 0 },
                            Position: { XScale: 0.095, XOffset: 0, YScale: 0.019, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Image: "rbxassetid://80304808453147",
                            ScaleType: "Fit",
                          },
                          children: [],
                        },
                        {
                          className: "ImageButton",
                          name: "PurchaseButton",
                          properties: {
                            Size: { XScale: 0.368, XOffset: 0, YScale: 0.229, YOffset: 0 },
                            Position: { XScale: 0.330, XOffset: 0, YScale: 0.662, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Image: "rbxassetid://121960215707315",
                            ScaleType: "Fit",
                          },
                          children: [
                            {
                              className: "ImageLabel",
                              name: "RobuxIcon",
                              properties: {
                                Size: { XScale: 0.298, XOffset: 0, YScale: 0.781, YOffset: 0 },
                                Position: { XScale: 0.137, XOffset: 0, YScale: 0.06, YOffset: 0 },
                                BackgroundTransparency: 1,
                                Image: "rbxassetid://80308670743296",
                              },
                              children: [],
                            },
                            {
                              className: "TextLabel",
                              name: "Price",
                              properties: {
                                Size: { XScale: 0.525, XOffset: 0, YScale: 0.856, YOffset: 0 },
                                Position: { XScale: 0.296, XOffset: 0, YScale: 0.032, YOffset: 0 },
                                BackgroundTransparency: 1,
                                Text: "99",
                                TextColor3: { R: 1, G: 1, B: 1 },
                                Font: "Bangers",
                                TextScaled: true,
                              },
                              children: [
                                { className: "UIStroke", name: "UIStroke", properties: { Thickness: 2.1, Color: { R: 0, G: 0, B: 0 } }, children: [] },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    // Bottom-right card: Gravity Coil
                    {
                      className: "ImageLabel",
                      name: "GravityCoilCard",
                      properties: {
                        Size: { XScale: 0.49, XOffset: 0, YScale: 0.49, YOffset: 0 },
                        Position: { XScale: 0.5, XOffset: 0, YScale: 0.5, YOffset: 0 },
                        BackgroundTransparency: 1,
                        Image: "rbxassetid://88273493633477",
                        ClipsDescendants: true,
                      },
                      children: [
                        {
                          className: "TextLabel",
                          name: "Title",
                          properties: {
                            Size: { XScale: 0.728, XOffset: 0, YScale: 0.236, YOffset: 0 },
                            Position: { XScale: 0.144, XOffset: 0, YScale: 0.075, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Text: "GRAVITY COIL",
                            TextColor3: { R: 1, G: 1, B: 1 },
                            Font: "FredokaOne",
                            TextScaled: true,
                          },
                          children: [
                            { className: "UIStroke", name: "UIStroke", properties: { Thickness: 2, Color: { R: 0, G: 0, B: 0 } }, children: [] },
                          ],
                        },
                        {
                          className: "ImageLabel",
                          name: "Icon",
                          properties: {
                            Size: { XScale: 0.249, XOffset: 0, YScale: 0.914, YOffset: 0 },
                            Position: { XScale: 0.095, XOffset: 0, YScale: 0.019, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Image: "rbxassetid://132184024338409",
                            ScaleType: "Fit",
                          },
                          children: [],
                        },
                        {
                          className: "ImageButton",
                          name: "PurchaseButton",
                          properties: {
                            Size: { XScale: 0.368, XOffset: 0, YScale: 0.229, YOffset: 0 },
                            Position: { XScale: 0.330, XOffset: 0, YScale: 0.662, YOffset: 0 },
                            BackgroundTransparency: 1,
                            Image: "rbxassetid://121960215707315",
                            ScaleType: "Fit",
                          },
                          children: [
                            {
                              className: "ImageLabel",
                              name: "RobuxIcon",
                              properties: {
                                Size: { XScale: 0.298, XOffset: 0, YScale: 0.781, YOffset: 0 },
                                Position: { XScale: 0.137, XOffset: 0, YScale: 0.06, YOffset: 0 },
                                BackgroundTransparency: 1,
                                Image: "rbxassetid://80308670743296",
                              },
                              children: [],
                            },
                            {
                              className: "TextLabel",
                              name: "Price",
                              properties: {
                                Size: { XScale: 0.525, XOffset: 0, YScale: 0.856, YOffset: 0 },
                                Position: { XScale: 0.296, XOffset: 0, YScale: 0.032, YOffset: 0 },
                                BackgroundTransparency: 1,
                                Text: "149",
                                TextColor3: { R: 1, G: 1, B: 1 },
                                Font: "Bangers",
                                TextScaled: true,
                              },
                              children: [
                                { className: "UIStroke", name: "UIStroke", properties: { Thickness: 2.1, Color: { R: 0, G: 0, B: 0 } }, children: [] },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// Test 2: Luau parser round-trip
const sampleLuau = `
local existing = game.StarterGui:FindFirstChild("TestUI")
if existing then existing:Destroy() end

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "TestUI"
screenGui.ResetOnSpawn = false
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.Parent = game.StarterGui

local frame = Instance.new("Frame")
frame.Name = "Panel"
frame.Size = UDim2.new(0.4, 0, 0.5, 0)
frame.Position = UDim2.new(0.5, 0, 0.5, 0)
frame.AnchorPoint = Vector2.new(0.5, 0.5)
frame.BackgroundColor3 = Color3.fromRGB(30, 30, 35)
frame.BackgroundTransparency = 0.1
frame.ClipsDescendants = true
frame.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 12)
corner.Parent = frame

local title = Instance.new("TextLabel")
title.Name = "Title"
title.Size = UDim2.fromScale(0.8, 0.1)
title.Position = UDim2.fromScale(0.5, 0.05)
title.AnchorPoint = Vector2.new(0.5, 0)
title.BackgroundTransparency = 1
title.Text = "Test Panel"
title.TextColor3 = Color3.new(1, 1, 1)
title.TextSize = 24
title.Font = Enum.Font.GothamBold
title.Parent = frame
`

// Generate Stud-styled .rbxmx
const studXml = serializeToRbxmx([studShop])
const studPath = resolve(__dirname, "..", "test-stud-shop.rbxmx")
writeFileSync(studPath, studXml, "utf-8")
console.log(`Stud shop: ${studPath} (${studXml.length} bytes)`)

// Test Luau parser
const parsed = parseLuauToTrees(sampleLuau)
console.log(`Luau parser: ${parsed.length} root(s), ${parsed[0]?.children.length} children`)
const parsedXml = serializeToRbxmx(parsed)
const parsedPath = resolve(__dirname, "..", "test-luau-parsed.rbxmx")
writeFileSync(parsedPath, parsedXml, "utf-8")
console.log(`Luau parsed: ${parsedPath} (${parsedXml.length} bytes)`)
