-- AI Chat Assistant (client executor script)
-- Uses request() for HTTP and TextChatService for sending messages

local Players = game:GetService("Players")
local TextChatService = game:GetService("TextChatService")
local HttpService = game:GetService("HttpService")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local API_KEY = "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"
local MODEL = "google/gemini-3.1-pro-preview-customtools"
local MAX_CHAT_LENGTH = 200

-- State
local currentResponse = ""
local isLoading = false

-- Destroy existing GUI if re-executed
local existing = playerGui:FindFirstChild("AIChatGui")
if existing then existing:Destroy() end

-- UI Construction
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "AIChatGui"
screenGui.ResetOnSpawn = false
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.Parent = playerGui

-- Toggle button
local toggleBtn = Instance.new("TextButton")
toggleBtn.Name = "Toggle"
toggleBtn.Size = UDim2.fromOffset(42, 42)
toggleBtn.Position = UDim2.new(1, -54, 0.5, -21)
toggleBtn.BackgroundColor3 = Color3.fromRGB(88, 101, 242)
toggleBtn.BorderSizePixel = 0
toggleBtn.Text = "AI"
toggleBtn.TextColor3 = Color3.new(1, 1, 1)
toggleBtn.TextSize = 14
toggleBtn.Font = Enum.Font.GothamBold
toggleBtn.Parent = screenGui
Instance.new("UICorner", toggleBtn).CornerRadius = UDim.new(0, 21)

-- Main panel
local panel = Instance.new("Frame")
panel.Name = "Panel"
panel.Size = UDim2.fromOffset(300, 410)
panel.Position = UDim2.new(0.5, -150, 0.5, -190)
panel.BackgroundColor3 = Color3.fromRGB(25, 25, 30)
panel.BorderSizePixel = 0
panel.Visible = false
panel.Parent = screenGui
Instance.new("UICorner", panel).CornerRadius = UDim.new(0, 10)

local panelStroke = Instance.new("UIStroke")
panelStroke.Color = Color3.fromRGB(55, 55, 65)
panelStroke.Thickness = 1
panelStroke.Parent = panel

-- Title bar
local titleBar = Instance.new("Frame")
titleBar.Name = "TitleBar"
titleBar.Size = UDim2.new(1, 0, 0, 38)
titleBar.BackgroundColor3 = Color3.fromRGB(32, 32, 40)
titleBar.BorderSizePixel = 0
titleBar.Parent = panel
Instance.new("UICorner", titleBar).CornerRadius = UDim.new(0, 10)

-- Bottom rect to square off title bar bottom corners
local titleBarFill = Instance.new("Frame")
titleBarFill.Size = UDim2.new(1, 0, 0, 12)
titleBarFill.Position = UDim2.new(0, 0, 1, -12)
titleBarFill.BackgroundColor3 = Color3.fromRGB(32, 32, 40)
titleBarFill.BorderSizePixel = 0
titleBarFill.Parent = titleBar

local titleLabel = Instance.new("TextLabel")
titleLabel.Size = UDim2.new(1, -44, 1, 0)
titleLabel.Position = UDim2.fromOffset(12, 0)
titleLabel.BackgroundTransparency = 1
titleLabel.Text = "AI Chat"
titleLabel.TextColor3 = Color3.new(1, 1, 1)
titleLabel.TextSize = 15
titleLabel.Font = Enum.Font.GothamBold
titleLabel.TextXAlignment = Enum.TextXAlignment.Left
titleLabel.Parent = titleBar

local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.fromOffset(28, 28)
closeBtn.Position = UDim2.new(1, -33, 0, 5)
closeBtn.BackgroundTransparency = 1
closeBtn.Text = "X"
closeBtn.TextColor3 = Color3.fromRGB(160, 160, 170)
closeBtn.TextSize = 15
closeBtn.Font = Enum.Font.GothamBold
closeBtn.Parent = titleBar

-- Prompt input (scrollable)
local inputScroll = Instance.new("ScrollingFrame")
inputScroll.Name = "InputScroll"
inputScroll.Size = UDim2.new(1, -24, 0, 80)
inputScroll.Position = UDim2.fromOffset(12, 48)
inputScroll.BackgroundColor3 = Color3.fromRGB(40, 40, 48)
inputScroll.BorderSizePixel = 0
inputScroll.ScrollBarThickness = 3
inputScroll.ScrollBarImageColor3 = Color3.fromRGB(88, 101, 242)
inputScroll.CanvasSize = UDim2.new(0, 0, 0, 0)
inputScroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
inputScroll.Parent = panel
Instance.new("UICorner", inputScroll).CornerRadius = UDim.new(0, 8)

local inputBox = Instance.new("TextBox")
inputBox.Name = "Input"
inputBox.Size = UDim2.new(1, -12, 0, 0)
inputBox.Position = UDim2.fromOffset(8, 6)
inputBox.AutomaticSize = Enum.AutomaticSize.Y
inputBox.BackgroundTransparency = 1
inputBox.Text = ""
inputBox.PlaceholderText = "Type a prompt..."
inputBox.TextColor3 = Color3.new(1, 1, 1)
inputBox.PlaceholderColor3 = Color3.fromRGB(100, 100, 110)
inputBox.TextSize = 13
inputBox.Font = Enum.Font.Gotham
inputBox.TextWrapped = true
inputBox.TextXAlignment = Enum.TextXAlignment.Left
inputBox.TextYAlignment = Enum.TextYAlignment.Top
inputBox.ClearTextOnFocus = false
inputBox.MultiLine = true
inputBox.Parent = inputScroll

-- Send button
local sendBtn = Instance.new("TextButton")
sendBtn.Name = "Send"
sendBtn.Size = UDim2.new(1, -24, 0, 32)
sendBtn.Position = UDim2.fromOffset(12, 136)
sendBtn.BackgroundColor3 = Color3.fromRGB(88, 101, 242)
sendBtn.BorderSizePixel = 0
sendBtn.Text = "Ask AI"
sendBtn.TextColor3 = Color3.new(1, 1, 1)
sendBtn.TextSize = 14
sendBtn.Font = Enum.Font.GothamBold
sendBtn.Parent = panel
Instance.new("UICorner", sendBtn).CornerRadius = UDim.new(0, 8)

-- Response area
local responseScroll = Instance.new("ScrollingFrame")
responseScroll.Name = "Response"
responseScroll.Size = UDim2.new(1, -24, 0, 150)
responseScroll.Position = UDim2.fromOffset(12, 178)
responseScroll.BackgroundColor3 = Color3.fromRGB(35, 35, 42)
responseScroll.BorderSizePixel = 0
responseScroll.ScrollBarThickness = 4
responseScroll.ScrollBarImageColor3 = Color3.fromRGB(88, 101, 242)
responseScroll.CanvasSize = UDim2.new(0, 0, 0, 0)
responseScroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
responseScroll.Parent = panel
Instance.new("UICorner", responseScroll).CornerRadius = UDim.new(0, 8)

local responseLabel = Instance.new("TextLabel")
responseLabel.Name = "Text"
responseLabel.Size = UDim2.new(1, -16, 0, 0)
responseLabel.Position = UDim2.fromOffset(8, 6)
responseLabel.AutomaticSize = Enum.AutomaticSize.Y
responseLabel.BackgroundTransparency = 1
responseLabel.Text = "Response appears here..."
responseLabel.TextColor3 = Color3.fromRGB(190, 190, 200)
responseLabel.TextSize = 13
responseLabel.Font = Enum.Font.Gotham
responseLabel.TextWrapped = true
responseLabel.TextXAlignment = Enum.TextXAlignment.Left
responseLabel.TextYAlignment = Enum.TextYAlignment.Top
responseLabel.Parent = responseScroll

-- Action buttons
local actionFrame = Instance.new("Frame")
actionFrame.Name = "Actions"
actionFrame.Size = UDim2.new(1, -24, 0, 34)
actionFrame.Position = UDim2.fromOffset(12, 338)
actionFrame.BackgroundTransparency = 1
actionFrame.Visible = false
actionFrame.Parent = panel

local acceptBtn = Instance.new("TextButton")
acceptBtn.Name = "Accept"
acceptBtn.Size = UDim2.new(0.48, 0, 1, 0)
acceptBtn.BackgroundColor3 = Color3.fromRGB(67, 181, 129)
acceptBtn.BorderSizePixel = 0
acceptBtn.Text = "Send in Chat"
acceptBtn.TextColor3 = Color3.new(1, 1, 1)
acceptBtn.TextSize = 13
acceptBtn.Font = Enum.Font.GothamBold
acceptBtn.Parent = actionFrame
Instance.new("UICorner", acceptBtn).CornerRadius = UDim.new(0, 8)

local declineBtn = Instance.new("TextButton")
declineBtn.Name = "Decline"
declineBtn.Size = UDim2.new(0.48, 0, 1, 0)
declineBtn.Position = UDim2.new(0.52, 0, 0, 0)
declineBtn.BackgroundColor3 = Color3.fromRGB(220, 65, 65)
declineBtn.BorderSizePixel = 0
declineBtn.Text = "Discard"
declineBtn.TextColor3 = Color3.new(1, 1, 1)
declineBtn.TextSize = 13
declineBtn.Font = Enum.Font.GothamBold
declineBtn.Parent = actionFrame
Instance.new("UICorner", declineBtn).CornerRadius = UDim.new(0, 8)

-- Dragging
local dragging = false
local dragStart, startPos

titleBar.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 then
		dragging = true
		dragStart = input.Position
		startPos = panel.Position
	end
end)

UserInputService.InputChanged:Connect(function(input)
	if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
		local delta = input.Position - dragStart
		panel.Position = UDim2.new(
			startPos.X.Scale, startPos.X.Offset + delta.X,
			startPos.Y.Scale, startPos.Y.Offset + delta.Y
		)
	end
end)

UserInputService.InputEnded:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 then
		dragging = false
	end
end)

-- Toggle
toggleBtn.MouseButton1Click:Connect(function()
	panel.Visible = not panel.Visible
end)

closeBtn.MouseButton1Click:Connect(function()
	panel.Visible = false
end)

-- AI Request
local function askAI(prompt: string): string
	local res = request({
		Url = "https://openrouter.ai/api/v1/chat/completions",
		Method = "POST",
		Headers = {
			["Content-Type"] = "application/json",
			["Authorization"] = "Bearer " .. API_KEY,
		},
		Body = HttpService:JSONEncode({
			model = MODEL,
			messages = {
				{
					role = "system",
					content = "You are a witty chat assistant in a Roblox game. Keep responses under 200 characters so they fit in Roblox chat. Be concise and fun.",
				},
				{ role = "user", content = prompt },
			},
		}),
	})

	if not res.Success then
		error("Request failed: " .. tostring(res.StatusCode))
	end

	local data = HttpService:JSONDecode(res.Body)
	return data.choices[1].message.content
end

-- Send prompt
sendBtn.MouseButton1Click:Connect(function()
	if isLoading then return end
	local prompt = inputBox.Text
	if prompt == "" then return end

	isLoading = true
	sendBtn.Text = "Thinking..."
	sendBtn.BackgroundColor3 = Color3.fromRGB(55, 55, 65)
	actionFrame.Visible = false
	responseLabel.Text = "Thinking..."

	local ok, result = pcall(askAI, prompt)

	isLoading = false
	sendBtn.Text = "Ask AI"
	sendBtn.BackgroundColor3 = Color3.fromRGB(88, 101, 242)

	if ok then
		currentResponse = result
		responseLabel.Text = result
		actionFrame.Visible = true
	else
		responseLabel.Text = "Error: " .. tostring(result)
	end
end)

-- Accept: send in chat
acceptBtn.MouseButton1Click:Connect(function()
	if currentResponse == "" then return end

	local msg = currentResponse
	if #msg > MAX_CHAT_LENGTH then
		msg = string.sub(msg, 1, MAX_CHAT_LENGTH)
	end

	local channel = TextChatService.TextChannels:FindFirstChild("RBXGeneral")
	if channel then
		channel:SendAsync(msg)
	end

	actionFrame.Visible = false
	currentResponse = ""
	responseLabel.Text = "Sent!"
end)

-- Decline: discard
declineBtn.MouseButton1Click:Connect(function()
	actionFrame.Visible = false
	currentResponse = ""
	responseLabel.Text = "Discarded."
end)
