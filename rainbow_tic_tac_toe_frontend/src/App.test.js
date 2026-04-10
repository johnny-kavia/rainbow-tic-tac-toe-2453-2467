import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the Rainbow Tic-Tac-Toe title", () => {
  render(<App />);
  expect(screen.getByText(/Rainbow Tic/i)).toBeInTheDocument();
});
