using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IrcMonitor.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProcessedLogFiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProcessedLogFiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FileName = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    ChannelId = table.Column<int>(type: "int", nullable: false),
                    RowCount = table.Column<int>(type: "int", nullable: false),
                    Created = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessedLogFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessedLogFiles_IrcChannels_ChannelId",
                        column: x => x.ChannelId,
                        principalTable: "IrcChannels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessedLogFiles_ChannelId",
                table: "ProcessedLogFiles",
                column: "ChannelId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessedLogFiles_FileName",
                table: "ProcessedLogFiles",
                column: "FileName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProcessedLogFiles");
        }
    }
}
