using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IrcMonitor.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeGroupedRows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TimeGroupedRows",
                columns: table => new
                {
                    Year = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Hour = table.Column<int>(type: "int", nullable: false),
                    ChannelId = table.Column<int>(type: "int", nullable: false),
                    Nick = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Count = table.Column<int>(type: "int", nullable: false),
                    Updated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeGroupedRows", x => new { x.Year, x.Hour, x.Month, x.ChannelId, x.Nick });
                    table.ForeignKey(
                        name: "FK_TimeGroupedRows_IrcChannels_ChannelId",
                        column: x => x.ChannelId,
                        principalTable: "IrcChannels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TimeGroupedRows_ChannelId",
                table: "TimeGroupedRows",
                column: "ChannelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TimeGroupedRows");
        }
    }
}
