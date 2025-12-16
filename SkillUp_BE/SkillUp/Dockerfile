# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore SkillUp.csproj
RUN dotnet publish SkillUp.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://0.0.0.0:5120
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5120

ENTRYPOINT ["dotnet", "SkillUp.dll"]