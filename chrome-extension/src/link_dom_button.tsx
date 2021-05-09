export default function getLinkButton(text: string): HTMLButtonElement {
  const button = document.createElement("button")
  button.innerHTML = text
  button.style.background = "none"
  button.style.border = "none"
  button.style.padding = "0!important!"
  button.style.fontFamily = "inherit"
  button.style.font = "inherit"
  button.style.color = "#069"
  button.style.cursor = "pointer"
  button.style.marginLeft = "2px"

  return button
}