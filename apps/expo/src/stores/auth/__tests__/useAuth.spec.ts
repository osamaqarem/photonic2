describe("useAuth", () => {
  describe("checkToken", () => {
    it.todo("Retrives existing refresh token from storage")

    it.todo(
      "Updates state as 'un-authenticated' if refresh token does not exist",
    )

    describe("When refresh token exists", () => {
      it.todo("Requests new access token from API")

      describe("When access token request is successsful", () => {
        it.todo("Updates state as 'authenticated'")
      })

      describe("When access token request fails", () => {
        describe("When refresh token is expired", () => {
          it.todo("Deletes the refresh token from storage")

          it.todo("Updates state as 'un-authenticated'")

          it.todo("Shows popup telling the user their session expired")
        })

        describe("When it fails due to network connection", () => {
          it.todo("Updates state as 'authenticated'")

          it.todo(
            "Subscribes to netinfo and calls 'checkToken' when connection is back",
          )
        })

        describe("When it fails due to unhandled error", () => {
          it.todo(
            "Updates state as 'un-authenticated' and shows error message to user",
          )
        })
      })
    })
  })
})
