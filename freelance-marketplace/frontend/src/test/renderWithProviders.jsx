/**
 * renderWithProviders — render a component inside the app's providers.
 */

import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";

import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

export function renderWithProviders(
  ui,
  { route = "/", ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export function renderWithRouter(
  ui,
  { route = "/", ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return (
      <ThemeProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </ThemeProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export default renderWithProviders;