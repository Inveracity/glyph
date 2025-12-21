package main

import (
	"embed"
	_ "embed"
	"log"

	hook "github.com/robotn/gohook"
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {

	// Create a new Wails application by providing the necessary options.
	// Variables 'Name' and 'Description' are for application metadata.
	// 'Assets' configures the asset server with the 'FS' variable pointing to the frontend files.
	// 'Bind' is a list of Go struct instances. The frontend has access to the methods of these instances.
	// 'Mac' options tailor the application when running an macOS.
	app := application.New(application.Options{
		Name:        "Character Map",
		Description: "Quick access to special characters and accents",
		Services: []application.Service{
			application.NewService(&CharacterService{}),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// Create a new window with the necessary options.
	// 'Title' is the title of the window.
	// 'Mac' options tailor the window when running on macOS.
	// 'BackgroundColour' is the background colour of the window.
	// 'URL' is the URL that will be loaded into the webview.
	// Window starts hidden and frameless (borderless)
	window := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:     "Character Map",
		Hidden:    true,
		Frameless: true,
		Width:     850,
		Height:    600,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(27, 38, 54),
		URL:              "/",
	})

	// Hide window when it loses focus (clicking outside)
	window.OnWindowEvent(events.Common.WindowLostFocus, func(event *application.WindowEvent) {
		window.Hide()
	})

	// Create a system tray that opens the window on click
	systemTray := app.SystemTray.New()

	// On Linux, systray requires a menu, so add an "Open" item as the primary action
	menu := app.NewMenu()
	menu.Add("Open").OnClick(func(data *application.Context) {
		window.Show()
		window.Focus()
	})
	menu.AddSeparator()
	menu.Add("Exit").OnClick(func(data *application.Context) {
		app.Quit()
	})

	systemTray.SetMenu(menu)
	systemTray.SetLabel("Character Map")

	// Register global hotkey Ctrl+Shift+Space to show the window
	go func() {
		// Start listening for keyboard events
		evChan := hook.Start()
		defer hook.End()

		ctrlPressed := false
		shiftPressed := false

		for ev := range evChan {
			// Track Ctrl key (29 for Left Ctrl, 3612 for Right Ctrl on Linux)
			if ev.Keycode == 29 || ev.Keycode == 3612 {
				if ev.Kind == hook.KeyDown {
					ctrlPressed = true
				} else if ev.Kind == hook.KeyUp {
					ctrlPressed = false
				}
			}

			// Track Shift key (42 for Left Shift, 54 for Right Shift on Linux)
			if ev.Keycode == 42 || ev.Keycode == 54 {
				if ev.Kind == hook.KeyDown {
					shiftPressed = true
				} else if ev.Kind == hook.KeyUp {
					shiftPressed = false
				}
			}

			// Check for Space (57 on Linux) with Ctrl+Shift
			if ev.Keycode == 57 && ev.Kind == hook.KeyDown {
				if ctrlPressed && shiftPressed {
					window.Show()
					window.Focus()
				}
			}
		}
	}()

	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}
