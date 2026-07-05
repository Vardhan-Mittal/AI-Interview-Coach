package resume

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/ledongthuc/pdf"
)

// ExtractTextFromPDF reads PDF bytes and returns the extracted text.
func ExtractTextFromPDF(fileData []byte) (string, error) {
	reader, err := pdf.NewReader(bytes.NewReader(fileData), int64(len(fileData)))
	if err != nil {
		return extractFallback(fileData)
	}

	numPages := reader.NumPage()
	if numPages == 0 {
		return extractFallback(fileData)
	}

	var allText strings.Builder
	for i := 1; i <= numPages; i++ {
		page := reader.Page(i)
		if page.V.IsNull() {
			continue
		}
		text, err := page.GetPlainText(nil)
		if err != nil {
			continue
		}
		allText.WriteString(text)
		allText.WriteString("\n")
	}

	result := cleanExtractedText(allText.String())
	if strings.TrimSpace(result) == "" {
		return extractFallback(fileData)
	}

	return result, nil
}

// extractFallback attempts text extraction from raw PDF bytes or BT/ET blocks.
func extractFallback(fileData []byte) (string, error) {
	content := string(fileData)

	var textParts []string
	inText := false
	var current strings.Builder

	for i := 0; i < len(content)-1; i++ {
		if !inText && i+2 <= len(content) && content[i:i+2] == "BT" {
			inText = true
			current.Reset()
			continue
		}
		if inText && i+2 <= len(content) && content[i:i+2] == "ET" {
			inText = false
			text := current.String()
			text = extractTjText(text)
			if text != "" {
				textParts = append(textParts, text)
			}
			continue
		}
		if inText {
			current.WriteByte(content[i])
		}
	}

	result := strings.Join(textParts, " ")
	result = cleanExtractedText(result)

	// If BT/ET extraction produced no text, extract all printable words of length >= 4
	if strings.TrimSpace(result) == "" {
		var words []string
		var word strings.Builder
		for _, b := range fileData {
			if (b >= 'a' && b <= 'z') || (b >= 'A' && b <= 'Z') || (b >= '0' && b <= '9') || b == ' ' || b == '.' || b == ',' || b == '@' || b == '-' {
				word.WriteByte(b)
			} else {
				if word.Len() >= 4 {
					words = append(words, word.String())
				}
				word.Reset()
			}
		}
		if word.Len() >= 4 {
			words = append(words, word.String())
		}
		result = cleanExtractedText(strings.Join(words, " "))
	}

	if strings.TrimSpace(result) == "" {
		return "", fmt.Errorf("could not extract text from PDF — the file may be image-based or scanned")
	}

	return result, nil
}

// extractTjText extracts text content from PDF Tj/TJ operators.
func extractTjText(raw string) string {
	var result strings.Builder

	inParens := 0
	for i := 0; i < len(raw); i++ {
		if raw[i] == '(' {
			inParens++
			if inParens == 1 {
				continue
			}
		}
		if raw[i] == ')' {
			inParens--
			if inParens == 0 {
				result.WriteByte(' ')
				continue
			}
		}
		if inParens > 0 {
			if raw[i] == '\\' && i+1 < len(raw) {
				i++
				switch raw[i] {
				case 'n':
					result.WriteByte('\n')
				case 'r':
					result.WriteByte('\r')
				case 't':
					result.WriteByte('\t')
				default:
					result.WriteByte(raw[i])
				}
				continue
			}
			result.WriteByte(raw[i])
		}
	}

	return strings.TrimSpace(result.String())
}

// cleanExtractedText normalizes extracted PDF text.
func cleanExtractedText(text string) string {
	for strings.Contains(text, "  ") {
		text = strings.ReplaceAll(text, "  ", " ")
	}
	for strings.Contains(text, "\n\n\n") {
		text = strings.ReplaceAll(text, "\n\n\n", "\n\n")
	}
	return strings.TrimSpace(text)
}
