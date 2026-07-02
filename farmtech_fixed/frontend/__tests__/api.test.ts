import { analyzeIrrigation, fetchForecast, fetchCommodities, fetchYieldPrediction } from "../lib/api"

// Mock global fetch
const mockGlobalFetch = (success: boolean, responseData: any, status = 200) => {
  (global as any).fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: success,
      status,
      json: () => Promise.resolve(responseData),
    })
  )
}

describe("Frontend API Client Tests", () => {
  const originalFetch = (global as any).fetch

  afterEach(() => {
    (global as any).fetch = originalFetch
  })

  // 1. Happy Paths
  test("fetchForecast happy path parses prices correctly", async () => {
    const mockResponse = {
      success: true,
      commodity: "Wheat",
      forecast: [
        { commodity: "Wheat", year: 2026, quarter: 1, price: 16000 },
        { commodity: "Wheat", year: 2026, quarter: 2, price: 16200 },
      ],
    }
    mockGlobalFetch(true, mockResponse)

    const result = await fetchForecast("Wheat")
    expect(result).toHaveLength(2)
    expect(result[0].price).toBe(16000)
    expect(result[1].quarter).toBe(2)
  })

  test("fetchCommodities returns list of crops", async () => {
    const mockResponse = {
      success: true,
      commodities: ["Wheat", "Rice", "Tomato"],
    }
    mockGlobalFetch(true, mockResponse)

    const result = await fetchCommodities()
    expect(result).toEqual(["Wheat", "Rice", "Tomato"])
  })

  test("analyzeIrrigation executes POST and returns recommendation", async () => {
    const mockResponse = {
      success: true,
      data: {
        irrigation_need_mm_season: 35.5,
        irrigation_class: "Moderate Irrigation Required",
      },
    }
    mockGlobalFetch(true, mockResponse)

    const result = await analyzeIrrigation({ lat: 30, lon: 31, crop: "wheat" })
    expect(result.irrigation_need_mm_season).toBe(35.5)
    expect(result.irrigation_class).toContain("Moderate")
  })

  test("fetchYieldPrediction queries yield endpoint", async () => {
    const mockResponse = {
      success: true,
      data: {
        crop: "wheat",
        yield_value: 6.8,
        unit: "Tons/Ha",
        source: "AI model",
      },
    }
    mockGlobalFetch(true, mockResponse)

    const result = await fetchYieldPrediction(30, 31, 2026, "wheat")
    expect(result.yield_value).toBe(6.8)
    expect(result.source).toBe("AI model")
  })

  // 2. Error handling & failures
  test("analyzeIrrigation throws error on API failure status", async () => {
    mockGlobalFetch(false, { error: "Invalid coordinates passed" }, 400)

    await expect(
      analyzeIrrigation({ lat: 999, lon: 999, crop: "wheat" })
    ).rejects.toThrow()
  })

  test("fetchForecast returns empty array on status error", async () => {
    mockGlobalFetch(false, {}, 500)
    await expect(fetchForecast("Wheat")).rejects.toThrow()
  })
})
