using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IrcMonitor.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ChangesToIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_IrcRows_ChannelId",
                table: "IrcRows");

            migrationBuilder.DropIndex(
                name: "IX_IrcRows_Nick",
                table: "IrcRows");

            migrationBuilder.CreateIndex(
                name: "IX_IrcRows_ChannelId_Nick_TimeStamp",
                table: "IrcRows",
                columns: new[] { "ChannelId", "Nick", "TimeStamp" });

            migrationBuilder.CreateIndex(
                name: "IX_IrcRows_ChannelId_TimeStamp",
                table: "IrcRows",
                columns: new[] { "ChannelId", "TimeStamp" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_IrcRows_ChannelId_Nick_TimeStamp",
                table: "IrcRows");

            migrationBuilder.DropIndex(
                name: "IX_IrcRows_ChannelId_TimeStamp",
                table: "IrcRows");

            migrationBuilder.CreateIndex(
                name: "IX_IrcRows_ChannelId",
                table: "IrcRows",
                column: "ChannelId");

            migrationBuilder.CreateIndex(
                name: "IX_IrcRows_Nick",
                table: "IrcRows",
                column: "Nick");
        }
    }
}
