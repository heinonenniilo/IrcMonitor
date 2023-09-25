using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IrcMonitor.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIrchannelsIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "IrcChannels",
                type: "bit",
                nullable: false,
                defaultValue: false);
                migrationBuilder.Sql($@"
    Update IrcChannels set IsActive = 1;
                ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "IrcChannels");
        }
    }
}
