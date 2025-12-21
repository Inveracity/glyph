package main

import (
	"time"

	"github.com/go-vgo/robotgo"
)

type CharacterService struct{}

// TypeCharacter types the given character at the current cursor position
func (c *CharacterService) TypeCharacter(char string) error {
	// Give time for the window to hide and focus to return to original app
	time.Sleep(200 * time.Millisecond)

	robotgo.Type(char)
	return nil
}
