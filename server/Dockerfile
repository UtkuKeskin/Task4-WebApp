FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY server/server.csproj ./
RUN dotnet restore

COPY server/. ./
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "server.dll"]